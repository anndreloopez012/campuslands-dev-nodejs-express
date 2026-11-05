import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { levantar } from '../soporte/cliente.js';

describe('API de equipos', () => {
  let cliente;

  beforeEach(async () => {
    cliente = await levantar(crearApp());
  });

  afterEach(() => cliente.cerrar());

  it('responde la ruta principal', async () => {
    const { status, cuerpo } = await cliente.pedir('');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'refactor de API' });
  });

  it('lista con paginacion y total en cabecera', async () => {
    const { cabeceras, cuerpo } = await cliente.pedir('/equipos?limite=3&pagina=3');
    assert.equal(cabeceras.get('x-total-count'), '8');
    assert.deepEqual(cuerpo.data.map((e) => e.id), [7, 8]);
    assert.deepEqual(cuerpo.paginacion, { pagina: 3, limite: 3, total: 8, totalPaginas: 3 });
  });

  it('filtra por modalidad y ordena por nombre', async () => {
    const { cuerpo } = await cliente.pedir('/equipos?modalidad=futbol_sala&orden=nombre');
    assert.deepEqual(cuerpo.data.map((e) => e.nombre), ['Cometas', 'Furias', 'Rayos', 'Truenos']);
  });

  it('rechaza consultas invalidas', async () => {
    for (const consulta of ['modalidad=rugby', 'orden=goles', 'limite=0', 'pagina=a', 'x=1']) {
      const { status, cuerpo } = await cliente.pedir(`/equipos?${consulta}`);
      assert.equal(status, 400, consulta);
      assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
    }
  });

  it('obtiene un equipo y responde 404 o 400 segun el id', async () => {
    const ok = await cliente.pedir('/equipos/1');
    assert.deepEqual(ok.cuerpo.data, { id: 1, nombre: 'Leones', modalidad: 'futbol' });
    const noExiste = await cliente.pedir('/equipos/99');
    assert.equal(noExiste.status, 404);
    assert.equal(noExiste.cuerpo.codigo, 'EQUIPO_NO_ENCONTRADO');
    assert.equal((await cliente.pedir('/equipos/abc')).status, 400);
  });

  it('crea un equipo con 201 y Location', async () => {
    const { status, cabeceras, cuerpo } = await cliente.json('/equipos', { nombre: ' Pumas ', modalidad: 'futbol' });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/intermedio/ejercicio-29/equipos/9');
    assert.deepEqual(cuerpo.data, { id: 9, nombre: 'Pumas', modalidad: 'futbol' });
  });

  it('valida el cuerpo al crear', async () => {
    const casos = [{}, { nombre: 'ab', modalidad: 'futbol' }, { nombre: 'Pumas', modalidad: 'rugby' }, { nombre: 'Pumas' }, { nombre: 'Pumas', modalidad: 'futbol', x: 1 }, { nombre: 7, modalidad: 'futbol' }];
    for (const cuerpo of casos) {
      const respuesta = await cliente.json('/equipos', cuerpo);
      assert.equal(respuesta.status, 400, JSON.stringify(cuerpo));
      assert.equal(respuesta.cuerpo.ok, false);
    }
  });

  it('no repite nombres sin importar mayusculas', async () => {
    const { status, cuerpo } = await cliente.json('/equipos', { nombre: 'LEONES', modalidad: 'futbol_sala' });
    assert.equal(status, 409);
    assert.equal(cuerpo.codigo, 'EQUIPO_DUPLICADO');
  });

  it('exige JSON y responde 405 con Allow', async () => {
    const tipo = await cliente.pedir('/equipos', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(tipo.status, 415);
    const metodo = await cliente.pedir('/equipos', { method: 'DELETE' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET, POST');
    assert.equal((await cliente.pedir('/equipos/1', { method: 'PUT' })).cabeceras.get('allow'), 'GET');
  });

  it('rechaza un JSON mal formado y un body demasiado grande', async () => {
    const roto = await cliente.pedir('/equipos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"nombre":' });
    assert.equal(roto.status, 400);
    assert.equal(roto.cuerpo.ok, false);
    const grande = await cliente.json('/equipos', { nombre: 'x'.repeat(20000), modalidad: 'futbol' });
    assert.equal(grande.status, 413);
  });

  it('responde 404 en rutas desconocidas', async () => {
    assert.equal((await cliente.pedir('/arbitros')).status, 404);
  });
});
