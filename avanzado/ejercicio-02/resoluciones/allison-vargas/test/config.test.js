import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cargarConfig } from '../src/config/index.js';

describe('configuracion', () => {
  it('usa valores por defecto cuando no hay variables', () => {
    const config = cargarConfig({});
    assert.deepEqual(config, {
      entorno: 'development',
      puerto: 3000,
      proxies: 0,
      apagadoMs: 10000,
      limite: { maximo: 100, ventanaMs: 60000 },
      cache: { ttlMs: 5000 },
    });
  });

  it('lee las variables de entorno', () => {
    const config = cargarConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      LIMITE_PETICIONES: '20',
      LIMITE_VENTANA_MS: '30000',
      CACHE_TTL_MS: '1000',
      APAGADO_TIMEOUT_MS: '2500',
      PROXIES_CONFIABLES: '1',
    });
    assert.equal(config.entorno, 'production');
    assert.equal(config.puerto, 8080);
    assert.deepEqual(config.limite, { maximo: 20, ventanaMs: 30000 });
    assert.equal(config.cache.ttlMs, 1000);
    assert.equal(config.apagadoMs, 2500);
    assert.equal(config.proxies, 1);
  });

  it('trata una variable vacia como no definida', () => {
    assert.equal(cargarConfig({ PORT: '' }).puerto, 3000);
  });

  it('informa todos los errores juntos', () => {
    assert.throws(
      () => cargarConfig({ PORT: 'abc', NODE_ENV: 'staging', LIMITE_PETICIONES: '0', CACHE_TTL_MS: '-5' }),
      (error) => {
        assert.match(error.message, /^Configuracion invalida:/);
        for (const nombre of ['PORT', 'NODE_ENV', 'LIMITE_PETICIONES', 'CACHE_TTL_MS']) {
          assert.match(error.message, new RegExp(nombre));
        }
        return true;
      },
    );
  });

  it('rechaza puertos fuera de rango y decimales', () => {
    for (const puerto of ['0', '65536', '30.5', '1e3', ' 80']) {
      assert.throws(() => cargarConfig({ PORT: puerto }), /PORT/, puerto);
    }
  });

  it('devuelve un objeto inmutable', () => {
    const config = cargarConfig({});
    assert.throws(() => {
      config.puerto = 1;
    }, TypeError);
    assert.throws(() => {
      config.limite.maximo = 1;
    }, TypeError);
  });
});
