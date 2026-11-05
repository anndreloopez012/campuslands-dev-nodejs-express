import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/versiones.js';

describe('v1: contrato congelado', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('la forma de un personaje no cambia', async () => {
    const { status, cuerpo } = await api.pedir('/v1/personajes/1');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, {
      ok: true,
      data: { id: 1, nombre: 'Aldric', clase: 'guerrero', nivel: 12, hp: 252 },
    });
  });

  it('la forma de un listado no cambia: arreglo completo y total', async () => {
    const { status, cuerpo } = await api.pedir('/v1/personajes');
    assert.equal(status, 200);
    assert.deepEqual(Object.keys(cuerpo), ['ok', 'data', 'total']);
    assert.equal(cuerpo.total, 8);
    assert.equal(cuerpo.data.length, 8);
    for (const personaje of cuerpo.data) {
      assert.deepEqual(Object.keys(personaje), ['id', 'nombre', 'clase', 'nivel', 'hp']);
    }
  });

  it('crear devuelve 201, Location y el mismo formato', async () => {
    const { status, cabeceras, cuerpo } = await api.json('/v1/personajes', { nombre: 'Nuevo Heroe', clase: 'arquero' });
    assert.equal(status, 201);
    assert.equal(cabeceras.get('location'), '/avanzado/ejercicio-01/v1/personajes/9');
    assert.deepEqual(cuerpo, { ok: true, data: { id: 9, nombre: 'Nuevo Heroe', clase: 'arquero', nivel: 1, hp: 90 } });
  });

  it('los errores conservan la forma { ok, message, codigo, errores }', async () => {
    const validacion = await api.json('/v1/personajes', { nombre: 'x' });
    assert.equal(validacion.status, 400);
    assert.deepEqual(validacion.cuerpo, {
      ok: false,
      message: 'Datos invalidos',
      codigo: 'VALIDACION',
      errores: [
        { campo: 'nombre', mensaje: 'debe tener entre 3 y 20 caracteres' },
        { campo: 'clase', mensaje: 'es obligatorio' },
      ],
    });
    const noExiste = await api.pedir('/v1/personajes/99');
    assert.deepEqual(noExiste.cuerpo, { ok: false, message: 'No existe el personaje 99', codigo: 'PERSONAJE_NO_ENCONTRADO' });
    assert.match(noExiste.cabeceras.get('content-type'), /^application\/json/);
  });
});

describe('v1: comportamiento', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('filtra por clase y rechaza parametros desconocidos o invalidos', async () => {
    const { cuerpo } = await api.pedir('/v1/personajes?clase=mago');
    assert.deepEqual(cuerpo.data.map((p) => p.nombre), ['Lysandra', 'Elowen', 'Mirel']);
    for (const consulta of ['clase=bardo', 'pagina=2', 'orden=nivel', 'clase=mago&clase=guerrero']) {
      const respuesta = await api.pedir(`/v1/personajes?${consulta}`);
      assert.equal(respuesta.status, 400, consulta);
      assert.equal(respuesta.cuerpo.codigo, 'CONSULTA_INVALIDA');
    }
  });

  it('valida el cuerpo y no repite nombres', async () => {
    for (const cuerpo of [{}, { nombre: 'Valido', clase: 'bardo' }, { nombre: 'Con1', clase: 'mago' }, { nombre: 'Valido', clase: 'mago', nivel: 5 }]) {
      assert.equal((await api.json('/v1/personajes', cuerpo)).status, 400, JSON.stringify(cuerpo));
    }
    const repetido = await api.json('/v1/personajes', { nombre: 'aldric', clase: 'mago' });
    assert.equal(repetido.status, 409);
    assert.equal(repetido.cuerpo.codigo, 'NOMBRE_DUPLICADO');
  });

  it('no ofrece PATCH ni DELETE: eso llego en v2', async () => {
    for (const metodo of ['PATCH', 'DELETE', 'PUT']) {
      const { status, cabeceras } = await api.pedir('/v1/personajes/1', { method: metodo });
      assert.equal(status, 405, metodo);
      assert.equal(cabeceras.get('allow'), 'GET');
    }
    assert.equal((await api.pedir('/v1/clases')).status, 404);
  });

  it('valida ids, tipo de contenido y JSON mal formado con el formato clasico', async () => {
    assert.equal((await api.pedir('/v1/personajes/abc')).cuerpo.codigo, 'ID_INVALIDO');
    const tipo = await api.pedir('/v1/personajes', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(tipo.status, 415);
    assert.equal(tipo.cuerpo.ok, false);
    const roto = await api.pedir('/v1/personajes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"nombre":' });
    assert.deepEqual([roto.status, roto.cuerpo.codigo], [400, 'JSON_INVALIDO']);
    const grande = await api.json('/v1/personajes', { nombre: 'x'.repeat(20000) });
    assert.equal(grande.status, 413);
  });

  it('rutas desconocidas dentro de v1 responden 404 con formato clasico', async () => {
    const { status, cuerpo } = await api.pedir('/v1/armas');
    assert.equal(status, 404);
    assert.equal(cuerpo.ok, false);
    assert.equal(cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('la raiz de v1 se describe a si misma', async () => {
    const { cuerpo } = await api.pedir('/v1');
    assert.deepEqual(cuerpo, { ok: true, data: { version: 'v1', estado: 'deprecada', sucesora: 'v2' } });
    assert.equal((await api.pedir('/v1', { method: 'POST' })).status, 405);
  });
});
