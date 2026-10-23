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

test('GET /basico/ejercicio-21', async () => {
  assert.equal((await json('/basico/ejercicio-21')).topic, 'estructura src routes controllers');
});

test('GET /animations y /characters', async () => {
  assert.equal((await json('/animations')).total, 3);
  assert.equal((await json('/characters')).total, 3);
});

test('detalle con validacion y 404', async () => {
  assert.equal((await json('/animations/2')).animation.name, 'Salto heroico');
  assert.equal((await json('/characters/3')).character.name, 'Dragon de Cristal');
  assert.equal((await get('/animations/99')).status, 404);
  assert.equal((await get('/characters/abc')).status, 400);
});

test('POST /animations crea (201) y valida (400)', async () => {
  const ok = await send('POST', '/animations', { name: 'Giro de espada', characterId: 2, durationSec: 1.5, fps: 60 });
  assert.equal(ok.status, 201);
  assert.equal(ok.headers.get('location'), '/animations/4');

  const bad = await send('POST', '/animations', { name: 'x', characterId: 99, durationSec: 0, fps: 12 });
  const body = await bad.json();
  assert.equal(bad.status, 400);
  assert.equal(body.errors.length, 4);
});
