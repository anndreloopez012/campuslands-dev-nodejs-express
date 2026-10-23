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

const KEY = { 'x-api-key': 'shooter-secret' };
const ADMIN = { ...KEY, 'x-role': 'admin' };
const call = (method, path, { headers = {}, body } = {}) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const valid = { name: 'Entry Pack', primary: 'assault', secondary: 'pistol' };

test('GET /basico/ejercicio-26 y /status-guide', async () => {
  assert.equal((await (await get('/basico/ejercicio-26')).json()).topic, 'codigos de estado');
  const guide = await (await get('/status-guide')).json();
  assert.ok(guide.codes.some((c) => c.code === 422));
});

test('200 y 201', async () => {
  assert.equal((await get('/loadouts')).status, 200);
  const res = await call('POST', '/loadouts', { headers: KEY, body: valid });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/loadouts/2');
  assert.equal((await res.json()).loadout.cost, 7);
});

test('401 sin credencial y 403 sin permiso', async () => {
  const noKey = await call('POST', '/loadouts', { body: valid });
  assert.equal(noKey.status, 401);
  assert.equal(noKey.headers.get('www-authenticate'), 'ApiKey');
  assert.equal((await call('POST', '/loadouts', { headers: { 'x-api-key': 'mala' }, body: valid })).status, 401);

  assert.equal((await call('DELETE', '/loadouts/1')).status, 401);
  assert.equal((await call('DELETE', '/loadouts/1', { headers: KEY })).status, 403);
  assert.equal((await call('GET', '/admin/stats', { headers: KEY })).status, 403);
  assert.equal((await call('GET', '/admin/stats', { headers: ADMIN })).status, 200);
});

test('400: peticion mal formada', async () => {
  const wrongTypes = await call('POST', '/loadouts', { headers: KEY, body: { name: 5, primary: [], secondary: null } });
  assert.equal(wrongTypes.status, 400);
  const broken = await fetch(`${base}/loadouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...KEY },
    body: '{roto',
  });
  assert.equal(broken.status, 400);
  assert.equal((await get('/loadouts/abc')).status, 400);
});

test('422: bien formada pero viola reglas de negocio', async () => {
  const overBudget = await call('POST', '/loadouts', { headers: KEY, body: { name: 'Caro', primary: 'sniper', secondary: 'revolver' } });
  const body = await overBudget.json();
  assert.equal(overBudget.status, 422);
  assert.match(body.details[0], /9 puntos/);

  const unknown = await call('POST', '/loadouts', { headers: KEY, body: { name: 'Raro', primary: 'laser', secondary: 'pistol' } });
  assert.equal(unknown.status, 422);
});

test('409: nombre repetido', async () => {
  assert.equal((await call('POST', '/loadouts', { headers: KEY, body: { ...valid, name: 'rush a' } })).status, 409);
});

test('404 y 415', async () => {
  assert.equal((await get('/loadouts/999')).status, 404);
  assert.equal((await get('/ruta-que-no-existe')).status, 404);
  const text = await fetch(`${base}/loadouts`, { method: 'POST', headers: { 'Content-Type': 'text/plain', ...KEY }, body: 'hola' });
  assert.equal(text.status, 415);
});

test('204: DELETE como admin', async () => {
  const res = await call('DELETE', '/loadouts/2', { headers: ADMIN });
  assert.equal(res.status, 204);
  assert.equal(await res.text(), '');
  assert.equal((await call('DELETE', '/loadouts/2', { headers: ADMIN })).status, 404);
});

test('503 con Retry-After en mantenimiento', async () => {
  assert.equal((await get('/matchmaking')).status, 200);
  process.env.MAINTENANCE = 'true';
  try {
    const res = await get('/matchmaking');
    assert.equal(res.status, 503);
    assert.equal(res.headers.get('retry-after'), '120');
  } finally {
    delete process.env.MAINTENANCE;
  }
});

test('500 sin filtrar detalles internos', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    const res = await get('/debug/error');
    const text = await res.text();
    assert.equal(res.status, 500);
    assert.doesNotMatch(text, /simulado/);
  } finally {
    console.error = original;
  }
});
