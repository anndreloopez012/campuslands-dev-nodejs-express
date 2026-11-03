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

test('GET /basico/ejercicio-02 responde con el tema', async () => {
  const res = await get('/basico/ejercicio-02');
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.topic, 'npm scripts y package.json');
});

test('GET /scripts lista los scripts de package.json', async () => {
  const body = await (await get('/scripts')).json();
  const names = body.scripts.map((s) => s.name);
  assert.ok(names.includes('start') && names.includes('dev') && names.includes('test'));
});

test('GET /scripts/:name devuelve 404 si no existe', async () => {
  const res = await get('/scripts/inexistente');
  assert.equal(res.status, 404);
});
