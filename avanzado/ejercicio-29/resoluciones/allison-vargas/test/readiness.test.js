import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

describe('preparación para despliegue', () => {
  it('informa correctamente disponibilidad y encabezados seguros', async () => {
    const server = createApp({ isReady: () => false }).listen(0);
    try {
      const url = `http://127.0.0.1:${server.address().port}`;
      const live = await fetch(`${url}/health/live`);
      assert.equal(live.status, 200);
      assert.equal(live.headers.get('x-content-type-options'), 'nosniff');
      assert.equal((await fetch(`${url}/health/ready`)).status, 503);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
  it('valida valores de despliegue', () => {
    assert.equal(loadConfig({ PORT: '8080' }).port, 8080);
    assert.throws(() => loadConfig({ PORT: '0' }), /PORT/);
    assert.throws(() => loadConfig({ SHUTDOWN_TIMEOUT_MS: '10' }), /SHUTDOWN_TIMEOUT_MS/);
  });
});
