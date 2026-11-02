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
const service = require('../src/services/players.service');

test('GET /basico/ejercicio-10', async () => {
  const body = await (await get('/basico/ejercicio-10')).json();
  assert.equal(body.topic, 'funciones asincronas');
});

test('una funcion async devuelve una promesa', async () => {
  const result = service.getPlayer(1);
  assert.ok(result instanceof Promise);
  assert.equal((await result).name, 'Kenji Mori');
});

test('GET /ranking ordena por puntos', async () => {
  const body = await (await get('/ranking')).json();
  assert.equal(body.ranking[0].name, 'Lin Zhao');
  assert.equal(body.ranking[0].position, 1);
  assert.ok(body.elapsedMs >= 25);
});

test('GET /players/:id valida y maneja errores', async () => {
  assert.equal((await get('/players/3')).status, 200);
  assert.equal((await get('/players/99')).status, 404);
  assert.equal((await get('/players/abc')).status, 400);
});

test('GET /event-loop muestra el orden de ejecucion', async () => {
  const body = await (await get('/event-loop')).json();
  assert.deepEqual(body.order, [
    'codigo sincrono',
    'Promise.then (microtarea)',
    'setTimeout 0 (macrotarea)',
  ]);
});
