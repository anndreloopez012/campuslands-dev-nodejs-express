import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearPartidosService } from '../src/services/partidos.service.js';
import { crearTablaService } from '../src/services/tabla.service.js';
import { MemoryRepository } from '../src/repositories/memory.repository.js';

describe('servicios con dependencias falsas', () => {
  const equiposFalsos = (mapa) => ({
    buscar: mock.fn((id) => mapa[id]),
    todos: mock.fn((modalidad) => Object.values(mapa).filter((e) => e.modalidad === modalidad)),
  });

  it('registrar consulta ambos equipos y guarda el partido', () => {
    const equipos = equiposFalsos({
      1: { id: 1, nombre: 'A', modalidad: 'futbol' },
      2: { id: 2, nombre: 'B', modalidad: 'futbol' },
    });
    const servicio = crearPartidosService({ repositorio: new MemoryRepository([]), equipos });
    const creado = servicio.registrar({ localId: 1, visitanteId: 2, golesLocal: 1, golesVisitante: 0 });
    assert.equal(creado.id, 1);
    assert.deepEqual(equipos.buscar.mock.calls.map((c) => c.arguments[0]), [1, 2]);
  });

  it('registrar no guarda nada cuando una regla falla', () => {
    const equipos = equiposFalsos({
      1: { id: 1, nombre: 'A', modalidad: 'futbol' },
      2: { id: 2, nombre: 'B', modalidad: 'futbol_sala' },
    });
    const repositorio = new MemoryRepository([]);
    const crear = mock.method(repositorio, 'crear');
    const servicio = crearPartidosService({ repositorio, equipos });
    assert.throws(() => servicio.registrar({ localId: 1, visitanteId: 2, golesLocal: 1, golesVisitante: 0 }), { codigo: 'MODALIDAD_DISTINTA' });
    assert.throws(() => servicio.registrar({ localId: 1, visitanteId: 1, golesLocal: 1, golesVisitante: 0 }), { codigo: 'MISMO_EQUIPO' });
    assert.throws(() => servicio.registrar({ localId: 1, visitanteId: 9, golesLocal: 1, golesVisitante: 0 }), { codigo: 'REFERENCIA_INVALIDA' });
    assert.equal(crear.mock.callCount(), 0);
  });

  it('la tabla usa solo los equipos de la modalidad pedida', () => {
    const equipos = equiposFalsos({
      1: { id: 1, nombre: 'A', modalidad: 'futbol' },
      2: { id: 2, nombre: 'B', modalidad: 'futbol' },
      3: { id: 3, nombre: 'C', modalidad: 'futbol_sala' },
    });
    const partidos = { todos: () => [{ localId: 1, visitanteId: 2, golesLocal: 2, golesVisitante: 0 }] };
    const tabla = crearTablaService({ equipos, partidos }).obtener({ modalidad: 'futbol' });
    assert.deepEqual(tabla.map((f) => [f.nombre, f.pts]), [['A', 3], ['B', 0]]);
    assert.deepEqual(equipos.todos.mock.calls[0].arguments, ['futbol']);
  });

  it('la tabla valida la consulta antes de leer datos', () => {
    const equipos = equiposFalsos({});
    const servicio = crearTablaService({ equipos, partidos: { todos: () => [] } });
    for (const query of [{}, { modalidad: 'rugby' }, { modalidad: ['futbol', 'futbol'] }, { modalidad: 'futbol', x: '1' }]) {
      assert.throws(() => servicio.obtener(query), { codigo: 'CONSULTA_INVALIDA' }, JSON.stringify(query));
    }
    assert.equal(equipos.todos.mock.callCount(), 0);
  });
});
