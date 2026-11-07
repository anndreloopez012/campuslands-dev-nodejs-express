/**
 * Repositorio de equipos/jugadores en memoria: la capa de datos del refactor.
 * Interfaz: all(tabla), allWhere(tabla, predicado), find(tabla, id),
 * save(tabla, registro) y remove(tabla, id) con secuencias de id estables.
 */
class FutbolRepository {
  constructor() {
    this.equipos = [
      { id: 1, nombre: 'Estrellas del Norte', ciudad: 'Quito' },
      { id: 2, nombre: 'Vetas Futsal', ciudad: 'Cusco' }
    ];
    this.jugadores = [
      { id: 1, equipoId: 1, nombre: 'Camilo Vertt', posicion: 'arquero' },
      { id: 2, equipoId: 2, nombre: 'Pilar Molina', posicion: 'delantero' }
    ];
    this.secuencias = { equipos: 2, jugadores: 2 };
  }

  nextId(tabla) {
    this.secuencias[tabla] += 1;
    return this.secuencias[tabla];
  }

  all(tabla) {
    return [...this[tabla]];
  }

  allWhere(tabla, predicado) {
    return this[tabla].filter(predicado);
  }

  find(tabla, id) {
    return this[tabla].find((actual) => actual.id === id) || null;
  }

  save(tabla, registro) {
    const fila = { id: this.nextId(tabla), ...registro };
    this[tabla].push(fila);
    return fila;
  }

  remove(tabla, id) {
    const indice = this[tabla].findIndex((actual) => actual.id === id);
    if (indice === -1) return false;
    this[tabla].splice(indice, 1);
    return true;
  }
}

module.exports = { FutbolRepository };
