import { EventEmitter } from 'node:events';
import { COMODIN, EVENTOS, LIMITES } from '../constants/eventos.js';
import { crear } from '../errores/index.js';

const METODOS = {
  'false-false': 'on',
  'false-true': 'once',
  'true-false': 'prependListener',
  'true-true': 'prependOnceListener',
};

export class BusDeEventos {
  #emisor = new EventEmitter();
  #suscripciones = new Map();
  #historial = [];
  #fallos = [];
  #pendientes = new Set();
  #emitidosPorEvento = new Map();
  #contadores = { emitidos: 0, entregas: 0, erroresDeListener: 0 };
  #siguienteSeq = 1;
  #siguienteSuscripcion = 1;
  #profundidad = 0;
  #reloj;
  #maxPorEvento;
  #profundidadMaxima;
  #capacidadHistorial;

  constructor({
    reloj = () => new Date(),
    maxPorEvento = LIMITES.maxPorEvento,
    profundidadMaxima = LIMITES.profundidadMaxima,
    capacidadHistorial = LIMITES.capacidadHistorial,
  } = {}) {
    this.#reloj = reloj;
    this.#maxPorEvento = maxPorEvento;
    this.#profundidadMaxima = profundidadMaxima;
    this.#capacidadHistorial = capacidadHistorial;
    this.#emisor.setMaxListeners(0);
  }

  suscribir(evento, manejador, { nombre = 'anonima', unaVez = false, alPrincipio = false, interna = false } = {}) {
    if (evento !== COMODIN && !EVENTOS[evento]) throw new TypeError(`Evento desconocido: ${evento}`);
    if (typeof manejador !== 'function') throw new TypeError('El manejador debe ser una funcion');
    const externas = [...this.#suscripciones.values()].filter((s) => s.evento === evento && !s.interna).length;
    if (!interna && externas >= this.#maxPorEvento) {
      throw crear('LIMITE_DE_SUSCRIPTORES', { evento, maximo: this.#maxPorEvento });
    }
    const suscripcion = {
      id: `sub-${this.#siguienteSuscripcion}`,
      nombre,
      evento,
      unaVez,
      interna,
      entregas: 0,
      errores: 0,
      envuelto: null,
    };
    this.#siguienteSuscripcion += 1;
    suscripcion.envuelto = (envoltorio) => this.#entregar(suscripcion, manejador, envoltorio);
    this.#emisor[METODOS[`${alPrincipio}-${unaVez}`]](evento, suscripcion.envuelto);
    this.#suscripciones.set(suscripcion.id, suscripcion);
    return { id: suscripcion.id, cancelar: () => this.cancelar(suscripcion.id) };
  }

  cancelar(id) {
    const suscripcion = this.#suscripciones.get(id);
    if (!suscripcion) return false;
    this.#emisor.off(suscripcion.evento, suscripcion.envuelto);
    this.#suscripciones.delete(id);
    return true;
  }

  existe(id) {
    return this.#suscripciones.has(id);
  }

  #entregar(suscripcion, manejador, envoltorio) {
    if (suscripcion.unaVez) this.#suscripciones.delete(suscripcion.id);
    suscripcion.entregas += 1;
    this.#contadores.entregas += 1;
    try {
      const resultado = manejador(envoltorio);
      if (resultado && typeof resultado.then === 'function') {
        const seguimiento = resultado.then(undefined, (error) => this.#fallar(suscripcion, envoltorio, error));
        this.#pendientes.add(seguimiento);
        seguimiento.finally(() => this.#pendientes.delete(seguimiento));
      }
    } catch (error) {
      this.#fallar(suscripcion, envoltorio, error);
    }
  }

  #fallar(suscripcion, envoltorio, error) {
    suscripcion.errores += 1;
    this.#contadores.erroresDeListener += 1;
    const mensaje = error instanceof Error ? error.message : String(error);
    this.#fallos.push({
      suscripcionId: suscripcion.id,
      nombre: suscripcion.nombre,
      evento: envoltorio.evento,
      seq: envoltorio.seq,
      mensaje,
      en: this.#reloj().toISOString(),
    });
    if (this.#fallos.length > LIMITES.maxFallos) this.#fallos.shift();
    if (envoltorio.evento === 'listener:error') return;
    try {
      this.emitir('listener:error', { suscripcionId: suscripcion.id, nombre: suscripcion.nombre, evento: envoltorio.evento, mensaje });
    } catch {
      return;
    }
  }

  emitir(evento, datos = {}) {
    const requeridos = EVENTOS[evento];
    if (!requeridos) throw new TypeError(`Evento desconocido: ${evento}`);
    for (const campo of requeridos) {
      if (datos[campo] === undefined) throw new TypeError(`Falta el campo ${campo} en ${evento}`);
    }
    if (this.#profundidad >= this.#profundidadMaxima) {
      throw crear('BUCLE_DE_EVENTOS', { evento, profundidad: this.#profundidadMaxima });
    }
    const envoltorio = Object.freeze({
      seq: this.#siguienteSeq,
      evento,
      en: this.#reloj().toISOString(),
      sesionId: datos.sesionId ?? null,
      datos: Object.freeze(structuredClone(datos)),
    });
    this.#siguienteSeq += 1;
    this.#historial.push(envoltorio);
    if (this.#historial.length > this.#capacidadHistorial) this.#historial.shift();
    this.#contadores.emitidos += 1;
    this.#emitidosPorEvento.set(evento, (this.#emitidosPorEvento.get(evento) ?? 0) + 1);
    this.#profundidad += 1;
    try {
      this.#emisor.emit(evento, envoltorio);
      this.#emisor.emit(COMODIN, envoltorio);
    } finally {
      this.#profundidad -= 1;
    }
    return envoltorio;
  }

  async esperarListeners() {
    while (this.#pendientes.size > 0) {
      await Promise.all([...this.#pendientes]);
    }
  }

  consultar({ evento, sesionId, desde = 0, limite = 20 } = {}) {
    const coincidentes = this.#historial.filter((e) => e.seq > desde
      && (!evento || e.evento === evento)
      && (sesionId === undefined || e.sesionId === sesionId));
    const data = coincidentes.slice(0, limite);
    return { data, siguiente: coincidentes.length > limite ? data.at(-1).seq : null };
  }

  obtenerEvento(seq) {
    return this.#historial.find((e) => e.seq === seq) ?? null;
  }

  suscripciones({ evento } = {}) {
    return [...this.#suscripciones.values()]
      .filter((s) => !evento || s.evento === evento)
      .map(({ id, nombre, evento: tipo, unaVez, interna, entregas, errores }) => ({
        id, nombre, evento: tipo, unaVez, interna, entregas, errores,
      }));
  }

  fallos() {
    return this.#fallos.map((f) => ({ ...f }));
  }

  estadisticas() {
    const porEvento = {};
    for (const evento of [...Object.keys(EVENTOS), COMODIN]) {
      porEvento[evento] = {
        emitidos: this.#emitidosPorEvento.get(evento) ?? 0,
        suscriptores: this.#emisor.listenerCount(evento),
      };
    }
    return {
      ...this.#contadores,
      enHistorial: this.#historial.length,
      suscripciones: this.#suscripciones.size,
      maxPorEvento: this.#maxPorEvento,
      profundidadMaxima: this.#profundidadMaxima,
      porEvento,
    };
  }
}
