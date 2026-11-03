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

test('GET /basico/ejercicio-25', async () => {
  assert.equal((await json('/basico/ejercicio-25')).topic, 'respuestas HTTP correctas');
});

test('200: lista con envoltorio, meta y cabecera X-Total-Count', async () => {
  const res = await get('/quests');
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(res.headers.get('x-total-count'), '3');
  assert.deepEqual([body.ok, body.meta.total, body.data.length], [true, 3, 3]);
});

test('201: creacion con Location y cuerpo', async () => {
  const res = await send('POST', '/quests', { title: 'Cazador de sombras', level: 10, reward: 400 });
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/quests/4');
  assert.equal(body.data.status, 'abierta');
});

test('200: PATCH completa la mision; 409 si ya estaba completada', async () => {
  const res = await send('PATCH', '/quests/4/complete');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).data.status, 'completada');

  const again = await send('PATCH', '/quests/4/complete');
  assert.equal(again.status, 409);
  assert.equal((await again.json()).error.code, 'ALREADY_COMPLETED');
});

test('204: DELETE sin cuerpo; luego 404', async () => {
  const res = await send('DELETE', '/quests/4');
  assert.equal(res.status, 204);
  assert.equal(await res.text(), '');
  assert.equal((await get('/quests/4')).status, 404);
});

test('errores con el mismo formato: 400, 404', async () => {
  const invalid = await send('POST', '/quests', { title: 'x', level: 0 });
  const body = await invalid.json();
  assert.equal(invalid.status, 400);
  assert.deepEqual([body.ok, body.error.code, body.error.details.length], [false, 'VALIDATION_ERROR', 3]);

  assert.equal((await get('/quests/abc')).status, 400);
  assert.equal((await get('/quests?status=otra')).status, 400);
  const missing = await get('/quests/999');
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'NOT_FOUND');
  assert.equal((await get('/nada')).status, 404);
});

test('JSON roto -> 400 INVALID_JSON', async () => {
  const res = await fetch(`${base}/quests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{roto' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'INVALID_JSON');
});
