const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('consulta y crea héroes por HTTP', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const baseUrl = `http://localhost:${server.address().port}`;

  const list = await fetch(`${baseUrl}/heroes`);
  assert.equal(list.status, 200);
  assert.deepEqual(await list.json(), [{ id: 1, name: 'Rook', class: 'warrior' }]);

  const created = await fetch(`${baseUrl}/heroes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ayla', class: 'mage' })
  });
  assert.equal(created.status, 201);
  assert.deepEqual(await created.json(), { id: 2, name: 'Ayla', class: 'mage' });
});
