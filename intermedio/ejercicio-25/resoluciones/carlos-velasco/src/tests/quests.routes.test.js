const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

/**
 * Tests de RUTAS: se levanta la app real en un puerto efimero (listen(0))
 * y se le dispara peticiones con fetch nativo. No mock: el pipeline
 * completo (rutas -> controladores -> servicios ->(error handler) corre de verdad.
 */
let server;
let base;

before(async () => {
  server = app.listen(0); // puerto 0 = pide uno libre al sistema
  await new Promise((resolve) => server.on('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

async function peticion(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (cuerpo !== undefined) opciones.body = JSON.stringify(cuerpo);
  const respuesta = await fetch(`${base}${ruta}`, opciones);
  const data = await respuesta.json().catch(() => null);
  return { estado: respuesta.status, data };
}

describe('rutas publicas', () => {
  it('GET /health responde 200 con topic declarado', async () => {
    const { estado, data } = await peticion('GET', '/health');
    assert.equal(estado, 200);
    assert.equal(data.topic, 'testing de rutas');
  });

  it('GET /heroes lista los heroes del gremio', async () => {
    const { estado, data } = await peticion('GET', '/heroes');
    assert.equal(estado, 200);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 2);
  });

  it('GET /heroes/999 responde 404 NotFoundError', async () => {
    const { estado, data } = await peticion('GET', '/heroes/999');
    assert.equal(estado, 404);
    assert.equal(data.error, 'NotFoundError');
  });

  it('ruta inexistente responde 404 con ok:false', async () => {
    const { estado, data } = await peticion('GET', '/gremios');
    assert.equal(estado, 404);
    assert.equal(data.ok, false);
  });
});

describe('POST /misiones', () => {
  it('crea una mision con datos validos -> 201', async () => {
    const { estado, data } = await peticion('POST', '/misiones', {
      titulo: 'Escoltar al Conde',
      dificultad: 'dificil',
      recompensa_oro: 500
    });
    assert.equal(estado, 201);
    assert.equal(data.data.titulo, 'Escoltar al Conde');
    assert.equal(data.data.heroeId, null);
  });

  it('rechaza titulo corto -> 400', async () => {
    const { estado, data } = await peticion('POST', '/misiones', {
      titulo: 'Bo',
      dificultad: 'facil',
      recompensa_oro: 10
    });
    assert.equal(estado, 400);
    assert.equal(data.error, 'ValidationError');
  });

  it('rechaza heroeId inexistente -> 404 (integridad referencial sobre HTTP)', async () => {
    const { estado, data } = await peticion('POST', '/misiones', {
      titulo: 'Mision sin dueno',
      dificultad: 'media',
      recompensa_oro: 100,
      heroeId: 77
    });
    assert.equal(estado, 404);
    assert.equal(data.error, 'NotFoundError');
  });
});

describe('POST /misiones/:id/asignar', () => {
  it('asigna un heroe a la mision creada -> 200', async () => {
    const { estado, data } = await peticion('POST', '/misiones/3/asignar', { heroeId: 1 });
    assert.equal(estado, 200);
    assert.equal(data.data.heroeId, 1);
  });

  it('no reasigna la mision ya tomada -> 400', async () => {
    const { estado, data } = await peticion('POST', '/misiones/3/asignar', { heroeId: 2 });
    assert.equal(estado, 400);
  });
});
