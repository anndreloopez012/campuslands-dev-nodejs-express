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

test('GET /basico/ejercicio-12', async () => {
  const body = await (await get('/basico/ejercicio-12')).json();
  assert.equal(body.topic, 'async await');
});

test('GET /movies/:id combina pelicula, director y resenas', async () => {
  const body = await (await get('/movies/1')).json();
  assert.equal(body.movie.director.name, 'Elena Ruiz');
  assert.equal(body.movie.reviews.length, 2);
  assert.equal(body.movie.averageScore, 7.5);
});

test('pelicula sin resenas tiene promedio null', async () => {
  const body = await (await get('/movies/3')).json();
  assert.equal(body.movie.averageScore, null);
});

test('errores: 404 por throw dentro de async y 400 por id invalido', async () => {
  assert.equal((await get('/movies/99')).status, 404);
  assert.equal((await get('/movies/abc')).status, 400);
});

test('paralelo es mas rapido que secuencial', async () => {
  const body = await (await get('/movies/1/benchmark')).json();
  assert.ok(body.parallelMs < body.sequentialMs, `${body.parallelMs} vs ${body.sequentialMs}`);
});
