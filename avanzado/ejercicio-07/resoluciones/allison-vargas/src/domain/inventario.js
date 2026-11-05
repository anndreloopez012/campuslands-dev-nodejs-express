import { ORDENES } from '../constants/autos.js';
import { crear } from '../errores/index.js';

const copia = (auto) => ({ ...auto });

export class Inventario {
  #autos = new Map();
  #siguienteId;
  #espera;
  #lecturas = { auto: 0, lista: 0, marca: 0 };

  constructor({ autos = [], espera = async () => {} } = {}) {
    for (const auto of autos) this.#autos.set(auto.id, copia(auto));
    this.#siguienteId = autos.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    this.#espera = espera;
  }

  async leer(id) {
    this.#lecturas.auto += 1;
    await this.#espera('auto', id);
    const auto = this.#autos.get(id);
    return auto ? copia(auto) : null;
  }

  async listar({ marca, categoria, minimo, maximo, disponible, orden = 'id' }) {
    this.#lecturas.lista += 1;
    await this.#espera('lista');
    return [...this.#autos.values()]
      .filter((a) => (!marca || a.marca.toLowerCase() === marca.toLowerCase())
        && (!categoria || a.categoria === categoria)
        && (minimo === undefined || a.precioUsd >= minimo)
        && (maximo === undefined || a.precioUsd <= maximo)
        && (disponible === undefined || a.disponible === disponible))
      .sort(ORDENES[orden])
      .map(copia);
  }

  async autosDeMarca(marca) {
    this.#lecturas.marca += 1;
    await this.#espera('marca', marca);
    return [...this.#autos.values()].filter((a) => a.marca.toLowerCase() === marca.toLowerCase()).map(copia);
  }

  #exigirVinLibre(vin, ignorarId) {
    for (const auto of this.#autos.values()) {
      if (auto.vin === vin && auto.id !== ignorarId) throw crear('VIN_DUPLICADO', { vin });
    }
  }

  async crear(datos) {
    await this.#espera('escritura');
    this.#exigirVinLibre(datos.vin);
    const auto = { id: this.#siguienteId, disponible: true, ...datos };
    this.#siguienteId += 1;
    this.#autos.set(auto.id, auto);
    return copia(auto);
  }

  async actualizar(id, cambios) {
    await this.#espera('escritura');
    const actual = this.#autos.get(id);
    if (!actual) throw crear('AUTO_NO_ENCONTRADO', { autoId: id });
    if (cambios.vin !== undefined) this.#exigirVinLibre(cambios.vin, id);
    const anterior = copia(actual);
    Object.assign(actual, cambios);
    return { anterior, actual: copia(actual) };
  }

  async eliminar(id) {
    await this.#espera('escritura');
    const actual = this.#autos.get(id);
    if (!actual) throw crear('AUTO_NO_ENCONTRADO', { autoId: id });
    this.#autos.delete(id);
    return copia(actual);
  }

  lecturas() {
    return { ...this.#lecturas, total: this.#lecturas.auto + this.#lecturas.lista + this.#lecturas.marca };
  }
}
