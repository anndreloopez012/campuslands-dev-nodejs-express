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

const jump = { jumper: 'Diego Paz', type: 'solo', altitudeFt: 12500 };

test('GET /basico/ejercicio-18', async () => {
  const body = await (await get('/basico/ejercicio-18')).json();
  assert.equal(body.topic, 'rutas POST');
});

test('POST /jumps crea un salto: 201 + Location + datos', async () => {
  const res = await send('POST', '/jumps', jump);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/jumps/2');
  assert.equal(body.jump.id, 2);
  assert.ok(body.jump.createdAt);
});

test('el salto creado se puede consultar con GET', async () => {
  const body = await (await get('/jumps/2')).json();
  assert.equal(body.jump.jumper, 'Diego Paz');
  assert.equal((await (await get('/jumps')).json()).total, 2);
});

test('POST /jumps valida los datos (400)', async () => {
  const res = await send('POST', '/jumps', { jumper: 'D', type: 'planeador', altitudeFt: 99999 });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.errors.length, 3);
});

test('POST sin cuerpo JSON o con JSON roto -> 400', async () => {
  assert.equal((await fetch(`${base}/jumps`, { method: 'POST' })).status, 400);
  const broken = await fetch(`${base}/jumps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{roto',
  });
  assert.equal(broken.status, 400);
});

test('GET /jumps/:id valida y maneja errores', async () => {
  assert.equal((await get('/jumps/99')).status, 404);
  assert.equal((await get('/jumps/x')).status, 400);
});
