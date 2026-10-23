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
const { parseInteger, parseList } = require('../src/utils/query');

const json = async (path) => (await get(path)).json();

test('GET /basico/ejercicio-19', async () => {
  assert.equal((await json('/basico/ejercicio-19')).topic, 'req.params y req.query');
});

test('parseInteger y parseList normalizan la query', () => {
  assert.equal(parseInteger(undefined, { fallback: 10 }), 10);
  assert.equal(parseInteger('5'), 5);
  assert.equal(parseInteger('0'), null);
  assert.equal(parseInteger('2.5'), null);
  assert.deepEqual(parseList(['Realismo', ' Acuarela ']), ['realismo', 'acuarela']);
  assert.deepEqual(parseList('realismo'), ['realismo']);
  assert.deepEqual(parseList(undefined), []);
});

test('GET /artists/:id usa req.params', async () => {
  assert.equal((await json('/artists/3')).artist.name, 'Valeria Ixcoy');
  assert.equal((await get('/artists/99')).status, 404);
  assert.equal((await get('/artists/abc')).status, 400);
});

test('GET /artists filtra con query (incluye parametro repetido)', async () => {
  assert.equal((await json('/artists')).total, 4);
  const realism = await json('/artists?style=realismo');
  assert.deepEqual(realism.artists.map((a) => a.name), ['Mateo Rojas', 'Sofia Marroquin']);
  const multi = await json('/artists?style=realismo&style=minimalista');
  assert.equal(multi.total, 3);
  assert.equal((await json('/artists?maxRate=50')).total, 2);
});

test('GET /artists ordena y limita', async () => {
  const body = await json('/artists?sort=hourlyRate&order=desc&limit=2');
  assert.deepEqual(body.artists.map((a) => a.hourlyRate), [75, 60]);
});

test('GET /artists valida la query (400)', async () => {
  for (const q of ['limit=0', 'limit=abc', 'maxRate=-5', 'sort=password', 'order=sideways']) {
    assert.equal((await get(`/artists?${q}`)).status, 400, q);
  }
});

test('GET /artists/:id/works combina params y query', async () => {
  assert.equal((await json('/artists/1/works')).total, 2);
  assert.equal((await json('/artists/1/works?minHours=7')).total, 1);
  assert.equal((await json('/artists/1/works?style=blackwork')).works[0].title, 'Lobo en blanco y negro');
  assert.equal((await get('/artists/99/works')).status, 404);
});

test('GET /studios/:studio/artists/:artistId usa dos parametros', async () => {
  assert.equal((await json('/studios/tinta-viva/artists/2')).artist.name, 'Andres Coti');
  assert.equal((await get('/studios/aguja-fina/artists/2')).status, 404);
  assert.equal((await get('/studios/tinta-viva/artists/x')).status, 400);
});
