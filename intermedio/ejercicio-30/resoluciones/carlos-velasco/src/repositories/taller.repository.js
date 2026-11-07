/**
 * Repositorio unico del taller: motos, repuestos y ordenes de trabajo.
 * Implementa el patron Repository con sequencias de id por tabla.
 */
class TallerRepository {
  constructor() {
    this.motos = [
      { id: 1, placa: 'ABC-123', marca: 'Krantz', modelo: 'Titan 200', cilindrada: 200, dueño: 'Lucho Vera' },
      { id: 2, placa: 'XYZ-889', marca: 'Nordica', modelo: 'Vulcana S', cilindrada: 650, dueño: 'Miriam Ort' }
    ];
    this.repuestos = [
      { id: 1, codigo: 'FT-01', nombre: 'Filtro de Transmision', stock: 12, precio_usd: 11.5 },
      { id: 2, codigo: 'CV-30', nombre: 'Cadena 428', stock: 0, precio_usd: 24.9 }
    ];
    this.ordenes = [];
    this.secuencias = { motos: 2, repuestos: 2, ordenes: 0 };
  }

  nextId(tabla) {
    this.secuencias[tabla] += 1;
    return this.secuencias[tabla];
  }

  all(tabla) {
    return [...this[tabla]];
  }

  find(tabla, id) {
    return this[tabla].find((actual) => actual.id === id) || null;
  }

  findPor(tabla, predicado) {
    return this[tabla].find(predicado) || null;
  }

  filter(tabla, predicado) {
    return this[tabla].filter(predicado);
  }

  save(tabla, registro) {
    const fila = { id: this.nextId(tabla), ...registro };
    this[tabla].push(fila);
    return fila;
  }

  update(tabla, id, cambios) {
    const fila = this.find(tabla, id);
    if (!fila) return null;
    Object.assign(fila, cambios);
    return fila;
  }

  remove(tabla, id) {
    const indice = this[tabla].findIndex((actual) => actual.id === id);
    if (indice === -1) return false;
    this[tabla].splice(indice, 1);
    return true;
  }
}

module.exports = { TallerRepository };
