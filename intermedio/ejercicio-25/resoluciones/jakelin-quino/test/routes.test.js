const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('GET /heroes entrega la lista de héroes', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const response = await fetch(`http://localhost:${server.address().port}/heroes`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{ name: 'Ayla', level: 4 }]);
});
