import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { leerConfig } from '../src/config/index.js';
import { crearDependencias } from '../src/config/dependencias.js';

describe('configuracion', () => {
  it('usa valores por defecto sin variables de entorno', () => {
    assert.deepEqual(leerConfig({}), { anticheatUrl: null, anticheatTimeoutMs: 2000, webhookUrl: null });
  });

  it('lee las variables recibidas, sin tocar process.env', () => {
    const config = leerConfig({
      ANTICHEAT_URL: 'http://anticheat.local',
      ANTICHEAT_TIMEOUT_MS: '500',
      WEBHOOK_URL: 'http://hooks.local/x',
    });
    assert.deepEqual(config, {
      anticheatUrl: 'http://anticheat.local',
      anticheatTimeoutMs: 500,
      webhookUrl: 'http://hooks.local/x',
    });
  });

  it('rechaza un timeout invalido', () => {
    for (const valor of ['50', 'abc', '20000', '1.5']) {
      assert.throws(() => leerConfig({ ANTICHEAT_TIMEOUT_MS: valor }), /ANTICHEAT_TIMEOUT_MS/);
    }
  });
});

describe('seleccion de dependencias', () => {
  it('usa el anticheat simulado y solo la bitacora sin configuracion', () => {
    const { anticheat, notificador, bitacora } = crearDependencias(leerConfig({}));
    assert.equal(anticheat.tipo, 'simulado');
    assert.equal(notificador.destinos, 1);
    assert.deepEqual(bitacora.recientes(), []);
  });

  it('usa el anticheat http y el webhook cuando hay urls', () => {
    const { anticheat, notificador } = crearDependencias(
      leerConfig({ ANTICHEAT_URL: 'http://anticheat.local', WEBHOOK_URL: 'http://hooks.local/x' }),
    );
    assert.equal(anticheat.tipo, 'http');
    assert.equal(notificador.destinos, 2);
  });
});
