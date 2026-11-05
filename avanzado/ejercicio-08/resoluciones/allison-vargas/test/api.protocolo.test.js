import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarApi } from '../soporte/api.js';

describe('API: protocolo', () => {
  let api;
  const internos = [];
  beforeEach(async () => {
    internos.length = 0;
    api = await levantarApi({ registro: (e) => internos.push(e) });
  });
  afterEach(() => api.cerrar());

  it('405 con Allow, OPTIONS 204 y 404 para rutas desconocidas', async () => {
    const metodo = await api.pedir('/sesiones', { method: 'DELETE' });
    assert.equal(metodo.status, 405);
    assert.equal(metodo.cabeceras.get('allow'), 'GET, POST');
    assert.equal((await api.pedir('/eventos', { method: 'OPTIONS' })).status, 204);
    assert.equal((await api.pedir('/bus/fallos', { method: 'POST' })).status, 405);
    assert.equal((await api.pedir('/eventos/stream', { method: 'POST' })).status, 405);
    const nada = await api.pedir('/nada');
    assert.equal(nada.status, 404);
    assert.equal(nada.cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });

  it('415 si no es JSON, 400 si esta roto y 413 si es enorme', async () => {
    const texto = await api.pedir('/sesiones', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' });
    assert.equal(texto.status, 415);
    const roto = await api.pedir('/sesiones', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"a":' });
    assert.equal(roto.cuerpo.codigo, 'JSON_INVALIDO');
    const grande = await api.json('/sesiones', { relleno: 'x'.repeat(11000) });
    assert.equal(grande.status, 413);
  });

  it('un fallo inesperado responde 500 generico y se registra aparte', async () => {
    api.servicios.sesiones.listar = () => { throw new Error('se cayo el cronometro'); };
    const { status, cuerpo } = await api.pedir('/sesiones');
    assert.equal(status, 500);
    assert.deepEqual(cuerpo, { ok: false, message: 'Error interno del servidor', codigo: 'ERROR_INTERNO' });
    assert.equal(internos.length, 1);
    assert.equal(internos[0].mensaje, 'se cayo el cronometro');
  });

  it('no expone la cabecera x-powered-by', async () => {
    assert.equal((await api.pedir('/')).cabeceras.get('x-powered-by'), null);
  });
});
