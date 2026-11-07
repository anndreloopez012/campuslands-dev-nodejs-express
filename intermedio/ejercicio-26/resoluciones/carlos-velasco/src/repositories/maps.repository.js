/**
 * MapRepository: la dependencia que el servicio necesita pero
 * que los tests reemplazan con un mock.
 *
 * La interfaz publica es: findById(id), all(), save(mapa)
 * El mock de las pruebas tiene la MISMA interfaz: eso es lo que hace
 * a un mock valido (sustituto conforme).
 */
class MapRepository {
  constructor(seed) {
    this.items = [...seed];
  }

  all() {
    return this.items;
  }

  findById(id) {
    return this.items.find((mapa) => mapa.id === id) || null;
  }

  save(mapa) {
    const nuevo = { id: this.nextId(), ...mapa };
    this.items.push(nuevo);
    return nuevo;
  }

  nextId() {
    return this.items.reduce((max, actual) => Math.max(max, actual.id), 0) + 1;
  }
}

module.exports = { MapRepository };
