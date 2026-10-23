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

test('GET /basico/ejercicio-20', async () => {
  const body = await (await get('/basico/ejercicio-20')).json();
  assert.equal(body.topic, 'middleware express.json');
});

test('requestId agrega X-Request-Id a cada respuesta', async () => {
  const a = (await get('/health')).headers.get('x-request-id');
  const b = (await get('/health')).headers.get('x-request-id');
  assert.match(a, /^[0-9a-f-]{36}$/);
  assert.notEqual(a, b);
});

test('los middlewares se ejecutan en el orden registrado', async () => {
  const body = await (await get('/middleware-order')).json();
  assert.deepEqual(body.trail, ['1. inicio', '2. despues de express.json', 'ruta (controlador)']);
});

test('express.json convierte el cuerpo en req.body', async () => {
  const body = await (await send('POST', '/echo', { nombre: 'pincel', valores: [1, 2] })).json();
  assert.equal(body.receivedType, 'object');
  assert.deepEqual(body.body, { nombre: 'pincel', valores: [1, 2] });
});

test('requireJson: sin Content-Type JSON -> 415', async () => {
  const res = await fetch(`${base}/echo`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'hola' });
  assert.equal(res.status, 415);
});

test('JSON roto -> 400 y cuerpo demasiado grande -> 413', async () => {
  const broken = await fetch(`${base}/echo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{roto' });
  assert.equal(broken.status, 400);
  const big = await send('POST', '/echo', { texto: 'x'.repeat(2000) });
  assert.equal(big.status, 413);
});

test('POST /brushes valida y crea', async () => {
  const brush = { name: 'Carboncillo', sizePx: 12, opacity: 0.6, color: '#333333' };
  const created = await send('POST', '/brushes', brush);
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('location'), '/brushes/3');
  const invalid = await send('POST', '/brushes', { name: 'x', sizePx: 0, opacity: 2, color: 'rojo' });
  assert.equal(invalid.status, 400);
  assert.equal((await (await get('/brushes')).json()).total, 3);
});
