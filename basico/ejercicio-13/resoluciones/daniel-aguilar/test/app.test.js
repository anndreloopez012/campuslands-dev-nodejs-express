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

const quiet = async (fn) => {
  const original = console.error;
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.error = original;
  }
};

test('GET /basico/ejercicio-13', async () => {
  const body = await (await get('/basico/ejercicio-13')).json();
  assert.equal(body.topic, 'manejo de errores');
});

test('NotFoundError -> 404 con formato uniforme', async () => {
  const res = await get('/stories/99');
  const body = await res.json();
  assert.equal(res.status, 404);
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'NOT_FOUND');
});

test('ValidationError -> 400 con detalles', async () => {
  const res = await send('POST', '/stories', { title: '' });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.equal(body.error.details.length, 3);
  assert.equal((await get('/stories/abc')).status, 400);
});

test('ConflictError -> 409 y creacion valida -> 201', async () => {
  const story = { title: 'Mundo Espejo', author: 'L. Paz', year: 2200 };
  assert.equal((await send('POST', '/stories', story)).status, 201);
  assert.equal((await send('POST', '/stories', story)).status, 409);
});

test('JSON mal formado -> 400 INVALID_JSON', async () => {
  const res = await fetch(`${base}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{roto',
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'INVALID_JSON');
});

test('errores inesperados -> 500 sin filtrar detalles', async () => {
  await quiet(async () => {
    for (const path of ['/crash/sync', '/crash/async']) {
      const res = await get(path);
      const text = await res.text();
      assert.equal(res.status, 500, path);
      assert.match(text, /INTERNAL_ERROR/);
      assert.doesNotMatch(text, /undefined|TypeError|simulado/);
    }
  });
});

test('ruta inexistente -> 404', async () => {
  assert.equal((await get('/no-existe')).status, 404);
});
