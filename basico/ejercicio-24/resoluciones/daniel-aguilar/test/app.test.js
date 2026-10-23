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
const ethanol = { name: 'Etanol', formula: 'C2H6O', molarMass: 46.07, category: 'organico' };

test('GET /basico/ejercicio-24', async () => {
  assert.equal((await json('/basico/ejercicio-24')).topic, 'CRUD basico');
});

test('CREATE: POST /compounds -> 201 + Location', async () => {
  const res = await send('POST', '/compounds', ethanol);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/compounds/4');
  assert.equal(body.compound.formula, 'C2H6O');
});

test('READ: lista, filtro por categoria y detalle', async () => {
  assert.equal((await json('/compounds')).total, 4);
  assert.equal((await json('/compounds?category=organico')).total, 2);
  assert.equal((await json('/compounds/2')).compound.formula, 'NaCl');
  assert.equal((await get('/compounds?category=raro')).status, 400);
});

test('UPDATE: PUT reemplaza el recurso completo', async () => {
  const res = await send('PUT', '/compounds/4', { ...ethanol, name: 'Alcohol etilico' });
  assert.equal(res.status, 200);
  assert.equal((await json('/compounds/4')).compound.name, 'Alcohol etilico');
  // PUT incompleto -> 400
  assert.equal((await send('PUT', '/compounds/4', { name: 'Solo nombre' })).status, 400);
  // PUT sobre inexistente -> 404
  assert.equal((await send('PUT', '/compounds/99', ethanol)).status, 404);
});

test('DELETE: 204 sin cuerpo y luego 404', async () => {
  const res = await send('DELETE', '/compounds/4');
  assert.equal(res.status, 204);
  assert.equal(await res.text(), '');
  assert.equal((await get('/compounds/4')).status, 404);
  assert.equal((await send('DELETE', '/compounds/4')).status, 404);
});

test('validaciones y conflictos', async () => {
  const bad = await send('POST', '/compounds', { name: 'x', formula: 'h2o', molarMass: -1, category: 'otro' });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).details.length, 4);
  assert.equal((await send('POST', '/compounds', { ...ethanol, formula: 'H2O' })).status, 409);
  assert.equal((await get('/compounds/abc')).status, 400);
});
