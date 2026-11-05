import { LIMITES } from '../constants/eventos.js';
import { crear } from '../errores/index.js';

export class Buzones {
  #buzones = new Map();
  #siguienteId = 1;
  #bus;
  #reloj;
  #maximo;

  constructor({ bus, reloj = () => new Date(), maximo = LIMITES.maxBuzones }) {
    this.#bus = bus;
    this.#reloj = reloj;
    this.#maximo = maximo;
  }

  #exigir(id) {
    const buzon = this.#buzones.get(id);
    if (!buzon) throw crear('BUZON_NO_ENCONTRADO', { buzonId: id });
    return buzon;
  }

  #vista(b, { conEventos = false } = {}) {
    const vista = {
      id: b.id,
      nombre: b.nombre,
      eventos: [...b.eventos],
      capacidad: b.capacidad,
      unaVez: b.unaVez,
      alPrincipio: b.alPrincipio,
      simularFallo: b.simularFallo,
      activo: b.suscripciones.some((s) => this.#bus.existe(s.id)),
      recibidos: b.recibidos,
      descartados: b.descartados,
      guardados: b.guardados.length,
      creadoEn: b.creadoEn,
    };
    if (conEventos) vista.eventosGuardados = [...b.guardados];
    return vista;
  }

  crear({ nombre, eventos, capacidad = 20, unaVez = false, alPrincipio = false, simularFallo = false }) {
    if (this.#buzones.size >= this.#maximo) throw crear('LIMITE_DE_BUZONES', { maximo: this.#maximo });
    const buzon = {
      id: this.#siguienteId,
      nombre,
      eventos: [...eventos],
      capacidad,
      unaVez,
      alPrincipio,
      simularFallo,
      recibidos: 0,
      descartados: 0,
      guardados: [],
      suscripciones: [],
      creadoEn: this.#reloj().toISOString(),
    };
    const recibir = (envoltorio) => {
      if (simularFallo) throw new Error(`el buzon ${nombre} fallo a proposito`);
      buzon.recibidos += 1;
      buzon.guardados.push(envoltorio);
      if (buzon.guardados.length > capacidad) {
        buzon.guardados.shift();
        buzon.descartados += 1;
      }
    };
    try {
      for (const evento of buzon.eventos) {
        buzon.suscripciones.push(this.#bus.suscribir(evento, recibir, { nombre: `buzon:${nombre}`, unaVez, alPrincipio }));
      }
    } catch (error) {
      for (const suscripcion of buzon.suscripciones) suscripcion.cancelar();
      throw error;
    }
    this.#siguienteId += 1;
    this.#buzones.set(buzon.id, buzon);
    return this.#vista(buzon);
  }

  obtener(id) {
    return this.#vista(this.#exigir(id), { conEventos: true });
  }

  listar() {
    return [...this.#buzones.values()].map((b) => this.#vista(b));
  }

  vaciar(id) {
    const buzon = this.#exigir(id);
    buzon.guardados.length = 0;
    return this.#vista(buzon);
  }

  eliminar(id) {
    const buzon = this.#exigir(id);
    for (const suscripcion of buzon.suscripciones) suscripcion.cancelar();
    this.#buzones.delete(id);
  }
}
