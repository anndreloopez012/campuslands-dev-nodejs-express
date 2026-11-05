export class MemoryRepository {
  #items = new Map();
  #siguienteId;

  constructor(iniciales = []) {
    iniciales.forEach((item) => this.#items.set(item.id, { ...item }));
    this.#siguienteId = iniciales.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  listar(predicado = () => true) {
    return [...this.#items.values()].filter(predicado).map((item) => ({ ...item }));
  }

  buscar(id) {
    const item = this.#items.get(id);
    return item ? { ...item } : null;
  }

  crear(datos) {
    const item = { id: this.#siguienteId++, ...datos };
    this.#items.set(item.id, item);
    return { ...item };
  }

  actualizar(id, cambios) {
    const actual = this.#items.get(id);
    if (!actual) return null;
    const actualizado = { ...actual, ...cambios, id };
    this.#items.set(id, actualizado);
    return { ...actualizado };
  }

  eliminar(id) {
    return this.#items.delete(id);
  }

  eliminarDonde(predicado) {
    let borrados = 0;
    for (const [id, item] of this.#items) {
      if (predicado(item)) {
        this.#items.delete(id);
        borrados += 1;
      }
    }
    return borrados;
  }
}
