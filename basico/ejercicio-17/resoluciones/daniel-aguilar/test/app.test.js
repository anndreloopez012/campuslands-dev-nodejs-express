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

test('GET /basico/ejercicio-17', async () => {
  const body = await (await get('/basico/ejercicio-17')).json();
  assert.equal(body.topic, 'rutas GET');
});

test('GET /destinations lista todo', async () => {
  const body = await (await get('/destinations')).json();
  assert.equal(body.total, 5);
});

test('GET /destinations/featured no se confunde con :id', async () => {
  const res = await get('/destinations/featured');
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.total, 3);
});

test('GET /destinations/:id valida y maneja errores', async () => {
  assert.equal((await (await get('/destinations/3')).json()).destination.name, 'Machu Picchu');
  assert.equal((await get('/destinations/99')).status, 404);
  assert.equal((await get('/destinations/abc')).status, 400);
});

test('GET /countries/:country/destinations es insensible a mayusculas', async () => {
  const body = await (await get('/countries/GUATEMALA/destinations')).json();
  assert.equal(body.total, 3);
  assert.equal((await get('/countries/narnia/destinations')).status, 404);
});
