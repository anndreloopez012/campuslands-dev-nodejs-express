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

test('GET / responde texto de bienvenida', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /sneakers/);
});

test('GET /basico/ejercicio-16', async () => {
  const body = await (await get('/basico/ejercicio-16')).json();
  assert.equal(body.topic, 'primer servidor Express');
});

test('GET /sneakers devuelve el catalogo', async () => {
  const body = await (await get('/sneakers')).json();
  assert.equal(body.total, 3);
  assert.equal(body.sneakers[0].brand, 'Nike');
});

test('ruta inexistente responde 404 en JSON', async () => {
  const res = await get('/zapatos');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).ok, false);
});
