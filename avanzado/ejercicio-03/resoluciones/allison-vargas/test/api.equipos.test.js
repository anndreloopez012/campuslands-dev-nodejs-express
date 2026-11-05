import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import { equipoValido } from '../soporte/datos.js';

describe('API de equipos', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('lista y filtra', async () => {
    const todos = await api.pedir('/equipos');
    assert.equal(todos.cabeceras.get('x-total-count'), '3');
    assert.deepEqual(todos.cuerpo.data.map((e) => e.tag), ['LDA', 'ANV', 'TRJ']);
    assert.deepEqual((await api.pedir('/equipos?region=EU')).cuerpo.data.map((e) => e.tag), ['ANV']);
    assert.deepEqual((await api.pedir('/equipos?buscar=ROJOS')).cuerpo.data.map((e) => e.tag), ['TRJ']);
    assert.deepEqual((await api.pedir('/equipos?orden=nombre')).cuerpo.data.map((e) => e.tag), ['ANV', 'LDA', 'TRJ']);
  });

  it('valida la consulta', async () => {
    for (const consulta of ['region=Z', 'orden=tag', 'limite=51', 'foo=1']) {
      assert.equal((await api.pedir(`/equipos?${consulta}`)).status, 400, consulta);
    }
  });

  it('consulta un equipo con sus jugadores', async () => {
    const { cuerpo } = await api.pedir('/equipos/2');
    assert.equal(cuerpo.data.nombre, 'Aurora Nova');
    assert.equal(cuerpo.data.jugadores.length, 5);
    assert.equal((await api.pedir('/equipos/9')).cuerpo.codigo, 'EQUIPO_NO_ENCONTRADO');
    assert.equal((await api.pedir('/equipos/uno')).status, 400);
  });

  it('crea un equipo normalizando tag, nombre y contacto', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/equipos', equipoValido());
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-03/equipos/4');
    assert.equal(cuerpo.data.nombre, 'Furia Austral');
    assert.equal(cuerpo.data.tag, 'FAU');
    assert.equal(cuerpo.data.contacto, null);
    assert.equal(cuerpo.data.jugadores.length, 5);
  });

  it('informa los errores anidados de jugadores', async () => {
    const jugadores = equipoValido().jugadores.map((j) => ({ ...j }));
    jugadores[1].capitan = false;
    jugadores[2].nick = 'x';
    jugadores[3].rol = 'top';
    const { status, cuerpo } = await api.json('/equipos', equipoValido({ jugadores, tag: 'MUYLARGO' }));
    assert.equal(status, 400);
    assert.deepEqual(cuerpo.errores.map((e) => `${e.ruta}:${e.codigo}`), [
      'tag:patron_invalido',
      'jugadores[2].nick:muy_corto',
    ]);
    const sinProblemasDeForma = equipoValido({ jugadores: jugadores.map((j, i) => (i === 2 ? { ...j, nick: 'Cometa' } : j)) });
    const reglas = await api.json('/equipos', sinProblemasDeForma);
    assert.deepEqual(reglas.cuerpo.errores.map((e) => `${e.ruta}:${e.codigo}`), [
      'jugadores[3].rol:duplicado',
    ]);
  });

  it('no repite nombre ni tag', async () => {
    const nombre = await api.json('/equipos', equipoValido({ nombre: 'aurora nova' }));
    assert.deepEqual([nombre.status, nombre.cuerpo.codigo], [409, 'NOMBRE_DUPLICADO']);
    const tag = await api.json('/equipos', equipoValido({ tag: 'trj' }));
    assert.deepEqual([tag.status, tag.cuerpo.codigo], [409, 'TAG_DUPLICADO']);
  });

  it('responde 405 con Allow', async () => {
    const lista = await api.pedir('/equipos', { method: 'PUT' });
    assert.deepEqual([lista.status, lista.cabeceras.get('allow')], [405, 'GET, POST']);
    const uno = await api.pedir('/equipos/1', { method: 'PATCH' });
    assert.deepEqual([uno.status, uno.cabeceras.get('allow')], [405, 'GET']);
  });
});
