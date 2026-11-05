import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('aplica valores predeterminados', () => {
    assert.deepEqual(loadConfig({}), { nodeEnv: 'development', port: 3000, logLevel: 'info', serviceName: 'moba-arena-api', trustProxy: false, corsOrigin: '*' });
  });
  it('convierte y valida valores de entorno', () => {
    assert.equal(loadConfig({ PORT: '8080', NODE_ENV: 'production', TRUST_PROXY: 'true' }).port, 8080);
    assert.throws(() => loadConfig({ PORT: '70000' }), /PORT/);
    assert.throws(() => loadConfig({ NODE_ENV: 'staging' }), /NODE_ENV/);
    assert.throws(() => loadConfig({ TRUST_PROXY: 'yes' }), /TRUST_PROXY/);
  });
});
