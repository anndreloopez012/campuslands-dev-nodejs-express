import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';
import { equipoValido, heroeValido } from '../soporte/datos.js';

describe('API de schemas', () => {
  let api;

  beforeEach(async () => {
    api = await levantarApi();
  });

  afterEach(() => api.cerrar());

  it('la ruta base describe el ejercicio', async () => {
    const { status, cuerpo } = await api.pedir('/');
    assert.equal(status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'validacion con schemas' });
  });

  it('lista los schemas disponibles', async () => {
    const { cuerpo } = await api.pedir('/schemas');
    assert.deepEqual(cuerpo.data, ['heroe', 'heroe-edicion', 'equipo', 'draft']);
  });

  it('publica cada schema como JSON Schema', async () => {
    const { status, cuerpo } = await api.pedir('/schemas/equipo');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.equal(cuerpo.data.type, 'object');
    assert.equal(cuerpo.data.additionalProperties, false);
    assert.deepEqual(cuerpo.data.required, ['nombre', 'tag', 'region', 'jugadores']);
    assert.equal(cuerpo.data.properties.jugadores.minItems, 5);
    assert.deepEqual(cuerpo.data['x-reglas'], ['exactamente un capitan']);
    const draft = (await api.pedir('/schemas/draft')).cuerpo.data;
    assert.deepEqual(draft.properties.acciones.items.discriminator, { propertyName: 'tipo' });
  });

  it('responde 404 para schemas que no existen, incluso nombres especiales', async () => {
    for (const nombre of ['nada', '__proto__', 'constructor', 'toString']) {
      const { status, cuerpo } = await api.pedir(`/schemas/${nombre}`);
      assert.equal(status, 404, nombre);
      assert.equal(cuerpo.codigo, 'SCHEMA_NO_ENCONTRADO');
    }
  });

  it('valida sin guardar: devuelve los datos ya normalizados', async () => {
    const { status, cuerpo } = await api.json('/schemas/heroe/validar', heroeValido());
    assert.equal(status, 200);
    assert.equal(cuerpo.data.valido, true);
    assert.equal(cuerpo.data.datos.nombre, 'Rayo Veloz');
    assert.equal((await api.pedir('/heroes')).cabeceras.get('x-total-count'), '10');
  });

  it('valida sin guardar: devuelve los errores con status 200', async () => {
    const { status, cuerpo } = await api.json('/schemas/equipo/validar', equipoValido({ tag: 'x', jugadores: [] }));
    assert.equal(status, 200);
    assert.equal(cuerpo.data.valido, false);
    assert.deepEqual(cuerpo.data.errores.map((e) => `${e.en}:${e.ruta}:${e.codigo}`), [
      'cuerpo:tag:patron_invalido',
      'cuerpo:jugadores:largo_invalido',
    ]);
  });

  it('valida el cuerpo del dry-run y el metodo', async () => {
    assert.equal((await api.json('/schemas/nada/validar', {})).status, 404);
    const tipo = await api.pedir('/schemas/heroe/validar', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(tipo.status, 415);
    const metodo = await api.pedir('/schemas/heroe/validar');
    assert.deepEqual([metodo.status, metodo.cabeceras.get('allow')], [405, 'POST']);
    assert.equal((await api.pedir('/schemas', { method: 'POST' })).cabeceras.get('allow'), 'GET');
  });

  it('las rutas desconocidas responden 404', async () => {
    const { status, cuerpo } = await api.pedir('/torneos');
    assert.deepEqual([status, cuerpo.codigo], [404, 'RUTA_NO_ENCONTRADA']);
  });
});
