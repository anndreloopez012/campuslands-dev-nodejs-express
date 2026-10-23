const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

let server;
let base;
before(
  () =>
    new Promise((resolve) => {
      server = createApp().listen(0, () => {
        base = `http://localhost:${server.address().port}`;
        resolve();
      });
    })
);
after(() => server.close());

const get = (path) => fetch(base + path);
const post = (body, headers = { 'Content-Type': 'application/json' }, raw = false) =>
  fetch(`${base}/dishes`, { method: 'POST', headers, body: raw ? body : JSON.stringify(body) });

test('GET /basico/ejercicio-15', async () => {
  const res = await get('/basico/ejercicio-15');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal((await res.json()).topic, 'mini API HTTP nativa');
});

test('GET /dishes lista y filtra por type', async () => {
  assert.equal((await (await get('/dishes')).json()).total, 3);
  assert.equal((await (await get('/dishes?type=taco')).json()).total, 1);
  assert.equal((await get('/dishes?type=pizza')).status, 400);
});

test('GET /dishes/:id extrae el parametro de la ruta', async () => {
  assert.equal((await (await get('/dishes/2')).json()).dish.type, 'hotdog');
  assert.equal((await get('/dishes/99')).status, 404);
  assert.equal((await get('/dishes/abc')).status, 400);
});

test('POST /dishes crea (201 + Location) y valida', async () => {
  const res = await post({ name: 'Churros', type: 'postre', price: 1.8 });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/dishes/4');
  assert.equal((await post({ name: 'x', type: 'otro', price: -1 })).status, 400);
});

test('POST /dishes: JSON roto -> 400, sin content-type -> 415', async () => {
  assert.equal((await post('{roto', undefined, true)).status, 400);
  assert.equal((await post('hola', { 'Content-Type': 'text/plain' }, true)).status, 415);
});

test('404 para rutas desconocidas y 405 para metodos no permitidos', async () => {
  assert.equal((await get('/nada')).status, 404);
  const res = await fetch(`${base}/dishes/1`, { method: 'DELETE' });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET');
});
