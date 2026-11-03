const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('la app devuelve partidas sin iniciar un puerto fijo', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const response = await fetch(`http://localhost:${server.address().port}/matches`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{ id: 1, map: 'Island' }]);
});
