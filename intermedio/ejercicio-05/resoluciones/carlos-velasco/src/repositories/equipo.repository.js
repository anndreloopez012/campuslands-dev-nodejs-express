/**
 * Repositorio de equipos en memoria.
 * Cada repositorio es la capa de acceso a datos: sabe como buscar, guardar
 * y borrar registros, pero no conoce la logica de negocio.
 */
class EquipoRepository {
  constructor(seed) {
    this.items = [...seed];
  }

  findAll({ filtro, orden } = {}) {
    let resultado = [...this.items];

    if (filtro) {
      const texto = filtro.toLowerCase();
      resultado = resultado.filter(
        (equipo) => equipo.name.toLowerCase().includes(texto) || equipo.ciudad.toLowerCase().includes(texto)
      );
    }

    if (orden === 'asc') {
      resultado.sort((a, b) => a.titulos - b.titulos);
    } else if (orden === 'desc') {
      resultado.sort((a, b) => b.titulos - a.titulos);
    }

    return resultado;
  }

  findById(id) {
    return this.items.find((equipo) => equipo.id === id) || null;
  }

  /**
   * Upsert: si el registro trae id existing se actualiza, si no se agrega.
   */
  save(equipo) {
    if (equipo.id && this.findById(equipo.id)) {
      const indice = this.items.findIndex((actual) => actual.id === equipo.id);
      this.items[indice] = { ...this.items[indice], ...equipo };
      return this.items[indice];
    }

    const nuevo = { id: this.nextId(), ...equipo };
    this.items.push(nuevo);
    return nuevo;
  }

  remove(id) {
    const indice = this.items.findIndex((equipo) => equipo.id === id);
    if (indice === -1) return false;
    this.items.splice(indice, 1);
    return true;
  }

  nextId() {
    return this.items.reduce((max, actual) => Math.max(max, actual.id), 0) + 1;
  }
}

module.exports = { EquipoRepository };
