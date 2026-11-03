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

test('GET /basico/ejercicio-05', async () => {
  const body = await (await get('/basico/ejercicio-05')).json();
  assert.equal(body.topic, 'fs para leer archivos');
});

test('GET /matches lee y parsea el JSON', async () => {
  const body = await (await get('/matches')).json();
  assert.equal(body.total, 3);
});

test('GET /stadiums lee un txt linea por linea', async () => {
  const body = await (await get('/stadiums')).json();
  assert.deepEqual(body.stadiums[0], 'Estadio Central');
});

test('GET /files/:name devuelve info del archivo', async () => {
  const body = await (await get('/files/stadiums')).json();
  assert.equal(body.file.lines, 4);
});

test('archivo inexistente (ENOENT) responde 404', async () => {
  assert.equal((await get('/files/ghost')).status, 404);
  assert.equal((await get('/files/otro')).status, 404);
});
