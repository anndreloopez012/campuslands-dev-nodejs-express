const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let base;

before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, () => {
        base = `http://localhost:${server.address().port}`;
        resolve();
      });
    })
);
after(() => server.close());

const get = (path) => fetch(base + path);
const send = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const json = async (path) => (await get(path)).json();

test('GET /health y /basico/ejercicio-29', async () => {
  assert.equal((await json('/health')).status, 'up');
  assert.equal((await json('/basico/ejercicio-29')).topic, 'README tecnico');
});

test('GET /teams lista y filtra por type', async () => {
  assert.equal((await json('/teams')).total, 3);
  assert.equal((await json('/teams?type=futbol-sala')).total, 1);
  assert.equal((await get('/teams?type=rugby')).status, 400);
});

test('GET /teams/:id', async () => {
  assert.equal((await json('/teams/1')).team.name, 'Cobras FC');
  assert.equal((await get('/teams/99')).status, 404);
  assert.equal((await get('/teams/abc')).status, 400);
});

test('POST /teams: 201, 400 y 409', async () => {
  const team = { name: 'Leones', type: 'futbol', city: 'Cobán', founded: 2001 };
  const ok = await send('POST', '/teams', team);
  assert.equal(ok.status, 201);
  assert.equal(ok.headers.get('location'), '/teams/4');
  assert.equal((await send('POST', '/teams', team)).status, 409);
  const bad = await send('POST', '/teams', { name: 'x', type: 'otro' });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).details.length, 4);
});
