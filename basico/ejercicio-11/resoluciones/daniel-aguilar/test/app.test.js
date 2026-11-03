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

test('GET /basico/ejercicio-11', async () => {
  const body = await (await get('/basico/ejercicio-11')).json();
  assert.equal(body.topic, 'promesas basicas');
});

test('encadena promesas: album + artista', async () => {
  const body = await (await get('/albums/1')).json();
  assert.equal(body.album.title, 'Noches de Neon');
  assert.equal(body.album.artist.name, 'DJ Pixel');
});

test('una promesa rechazada llega al .catch y responde 404', async () => {
  assert.equal((await get('/albums/99')).status, 404);
  assert.equal((await get('/albums/abc')).status, 400);
});

test('Promise.all en /summary', async () => {
  const body = await (await get('/summary')).json();
  assert.deepEqual([body.totalAlbums, body.totalArtists], [3, 3]);
});

test('Promise.allSettled en /albums/batch', async () => {
  const body = await (await get('/albums/batch?ids=1,99,3')).json();
  assert.deepEqual(body.results.map((r) => r.status), ['ok', 'error', 'ok']);
  assert.equal((await get('/albums/batch')).status, 400);
});

test('.finally cuenta todas las consultas', async () => {
  const before = (await (await get('/stats')).json()).lookups;
  await get('/albums/99');
  const after = (await (await get('/stats')).json()).lookups;
  assert.equal(after, before + 1);
});
