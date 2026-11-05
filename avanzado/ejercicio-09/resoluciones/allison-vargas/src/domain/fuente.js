import { TOTAL_COMBATES } from '../constants/combates.js';
import { agruparPorCategoria, generarCombate } from './generador.js';

export class Fuente {
  #porCategoria;
  #total;
  #importados = [];

  constructor({ peleadores, total = TOTAL_COMBATES }) {
    this.#porCategoria = agruparPorCategoria(peleadores);
    this.#total = total;
  }

  get cantidad() {
    return this.#total + this.#importados.length;
  }

  obtener(id) {
    if (id < 1) return null;
    if (id <= this.#total) return generarCombate(id, this.#porCategoria);
    return this.#importados[id - this.#total - 1] ?? null;
  }

  async *recorrer() {
    const limite = this.cantidad;
    for (let id = 1; id <= limite; id += 1) yield this.obtener(id);
  }

  importar(combates) {
    const primero = this.cantidad + 1;
    for (const combate of combates) {
      this.#importados.push({ ...combate, id: this.cantidad + 1 });
    }
    return combates.length === 0 ? null : { primero, ultimo: this.cantidad };
  }
}
