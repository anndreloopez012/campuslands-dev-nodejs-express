import { CAPACIDAD_DIARIO } from '../constants/futbol.js';

export class Diario {
  #entradas = [];
  #capacidad;

  constructor(capacidad = CAPACIDAD_DIARIO) {
    this.#capacidad = capacidad;
  }

  registrar(entrada) {
    this.#entradas.push(Object.freeze(entrada));
    if (this.#entradas.length > this.#capacidad) this.#entradas.shift();
  }

  listar({ estado, nombre } = {}) {
    return this.#entradas
      .filter((entrada) => (!estado || entrada.estado === estado) && (!nombre || entrada.nombre === nombre))
      .map((entrada) => structuredClone(entrada));
  }
}
