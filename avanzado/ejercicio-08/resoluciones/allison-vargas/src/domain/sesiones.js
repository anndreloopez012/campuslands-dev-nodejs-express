import { LIMITES } from '../constants/eventos.js';
import { crear } from '../errores/index.js';

export class Sesiones {
  #sesiones = new Map();
  #siguienteId = 1;
  #bus;
  #reloj;
  #autos;
  #maxVueltas;

  constructor({ bus, reloj = () => new Date(), autos, maxVueltas = LIMITES.maxVueltas }) {
    this.#bus = bus;
    this.#reloj = reloj;
    this.#autos = autos;
    this.#maxVueltas = maxVueltas;
  }

  #exigir(id) {
    const sesion = this.#sesiones.get(id);
    if (!sesion) throw crear('SESION_NO_ENCONTRADA', { sesionId: id });
    return sesion;
  }

  #exigirAbierta(id) {
    const sesion = this.#exigir(id);
    if (sesion.estado !== 'en_pista') throw crear('SESION_CERRADA', { sesionId: id, estado: sesion.estado });
    return sesion;
  }

  #vista(s) {
    return {
      id: s.id,
      piloto: s.piloto,
      auto: s.auto,
      autoNombre: this.#autos.find((a) => a.id === s.auto)?.nombre ?? null,
      circuitoId: s.circuitoId,
      estado: s.estado,
      motivo: s.motivo,
      vueltas: s.vueltas.map((v) => ({ ...v })),
      mejorVueltaMs: s.mejorVueltaMs,
      iniciadaEn: s.iniciadaEn,
      cerradaEn: s.cerradaEn,
    };
  }

  crear({ piloto, auto, circuitoId }) {
    const sesion = {
      id: this.#siguienteId,
      piloto,
      auto,
      circuitoId,
      estado: 'en_pista',
      motivo: null,
      vueltas: [],
      mejorVueltaMs: null,
      iniciadaEn: this.#reloj().toISOString(),
      cerradaEn: null,
    };
    this.#siguienteId += 1;
    this.#sesiones.set(sesion.id, sesion);
    this.#bus.emitir('sesion:iniciada', { sesionId: sesion.id, piloto, auto, circuitoId });
    return this.#vista(sesion);
  }

  registrarVuelta(id, { tiempoMs, tempMotor, desgaste }) {
    const sesion = this.#exigirAbierta(id);
    const vuelta = sesion.vueltas.length + 1;
    sesion.vueltas.push({ vuelta, tiempoMs, tempMotor, desgaste });
    if (sesion.mejorVueltaMs === null || tiempoMs < sesion.mejorVueltaMs) sesion.mejorVueltaMs = tiempoMs;
    this.#bus.emitir('vuelta:completada', { sesionId: id, vuelta, tiempoMs, tempMotor, desgaste });
    if (sesion.estado === 'en_pista' && vuelta >= this.#maxVueltas) this.finalizar(id, 'limite de vueltas');
    return this.#vista(sesion);
  }

  finalizar(id, motivo = 'finalizada por el piloto') {
    const sesion = this.#exigirAbierta(id);
    sesion.estado = 'finalizada';
    sesion.motivo = motivo;
    sesion.cerradaEn = this.#reloj().toISOString();
    this.#bus.emitir('sesion:finalizada', {
      sesionId: id,
      vueltas: sesion.vueltas.length,
      mejorVueltaMs: sesion.mejorVueltaMs,
      motivo,
    });
    return this.#vista(sesion);
  }

  abortar(id, motivo) {
    const sesion = this.#exigirAbierta(id);
    sesion.estado = 'abortada';
    sesion.motivo = motivo;
    sesion.cerradaEn = this.#reloj().toISOString();
    this.#bus.emitir('sesion:abortada', { sesionId: id, vueltas: sesion.vueltas.length, motivo });
    return this.#vista(sesion);
  }

  obtener(id) {
    return this.#vista(this.#exigir(id));
  }

  listar({ estado, circuitoId } = {}) {
    return [...this.#sesiones.values()]
      .filter((s) => (!estado || s.estado === estado) && (circuitoId === undefined || s.circuitoId === circuitoId))
      .map((s) => this.#vista(s));
  }
}
