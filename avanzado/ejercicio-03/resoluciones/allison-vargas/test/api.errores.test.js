import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from '../soporte/cliente.js';

describe('errores inesperados', () => {
  let api;

  afterEach(async () => {
    mock.restoreAll();
    await api.cerrar();
  });

  it('responden 500 generico y no filtran el detalle interno', async () => {
    const registro = mock.method(console, 'error', () => {});
    const servicios = crearServicios();
    servicios.heroes.listar = () => {
      throw new Error('contrasena de la base: 1234');
    };
    api = await levantar(crearApp({ servicios }));

    const { status, cuerpo } = await api.pedir('/heroes');

    assert.equal(status, 500);
    assert.deepEqual(cuerpo, { ok: false, message: 'Error interno del servidor', codigo: 'ERROR_INTERNO' });
    assert.equal(registro.mock.callCount(), 1);
    assert.match(registro.mock.calls[0].arguments[0].message, /contrasena/);
  });
});
