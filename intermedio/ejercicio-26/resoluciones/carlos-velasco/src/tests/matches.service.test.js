const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const { MatchService } = require('../services/matches.service');
const { MapRepository } = require('../repositories/maps.repository');

/**
 * MOCK del repositorio de mapas.
 * El test NO toca un storage real: el servicio recibe este doble
 * con la misma interfaz (findById/all/save), verificada por los tests.
 */
function crearMockRepositorio() {
  const llamadas = { findById: [], all: 0 };

  const repositorio = {
    all() {
      llamadas.all += 1;
      return [
        { id: 1, name: 'Distrito 9', modo: 'tdm' },
        { id: 2, name: 'Torre Frente', modo: 'ctf' }
      ];
    },
    findById(id) {
      llamadas.findById.push(id);
      return this.all().find((mapa) => mapa.id === id) || null;
    },
    save(mapa) {
      return { id: 99, ...mapa };
    },
    // utilidades de introspeccion del mock
    interacciones: llamadas
  };

  return repositorio;
}

let servicio;
let mockRepositorio;

beforeEach(() => {
  mockRepositorio = crearMockRepositorio();
  servicio = new MatchService({ mapRepository: mockRepositorio });
});

describe('Mock de dependencia: MatchService + repositorio falso', () => {
  it('el listar de mapas delega en el mock (sin storage real)', () => {
    const mapas = servicio.listarMapas();
    assert.equal(mapas.length, 2);
    assert.equal(mockRepositorio.interacciones.all, 1);
  });

  it('crearPartida valida el mapa contra el mock, no contra datos reales', () => {
    const partida = servicio.crearPartida({ mapId: 2, titulo: 'Ranked CL', modo: 'ctf' });
    assert.equal(partida.mapId, 2);
    assert.deepEqual(mockRepositorio.interacciones.findById, [2]);
  });

  it('lanza ValidationError si el mock no conoce el mapa', () => {
    assert.throws(
      () => servicio.crearPartida({ mapId: 77, titulo: 'Ranked Ghost', modo: 'dm' }),
      (error) => error.name === 'ValidationError' && /77/.test(error.message)
    );
  });

  it('crearPartida valida el titulo y el modo ANTES de tocar el mock', () => {
    assert.throws(
      () => servicio.crearPartida({ mapId: 1, titulo: 'Bo', modo: 'dm' }),
      (error) => error.name === 'ValidationError'
    );
    // el mock no fue consultado: fallo antes de tocar la dependencia
    assert.deepEqual(mockRepositorio.interacciones.findById, []);
  });

  it('mock.fn del runner: registrar y restaurar una funcion falsa', () => {
    const falsa = mock.fn((id) => ({ id, name: 'MockFn', modo: 'dm' }));
    const servicioFake = new MatchService({ mapRepository: { findById: falsa, all: mock.fn(() => []) } });

    const mapa = servicioFake.obtenerMapa(5);
    assert.deepEqual(mapa, { id: 5, name: 'MockFn', modo: 'dm' });

    // verificamos Llamadas del mock del propio runner node:test
    assert.equal(falsa.mock.callCount(), 1);
    assert.deepEqual(falsa.mock.calls[0].arguments, [5]);
  });
});
