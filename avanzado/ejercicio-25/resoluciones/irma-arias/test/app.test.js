const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
test('la API RPG responde correctamente', async () => {
  const server = app.listen(0);
  try {
    const response = await fetch(`http://localhost:${server.address().port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, game: 'RPG' });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
