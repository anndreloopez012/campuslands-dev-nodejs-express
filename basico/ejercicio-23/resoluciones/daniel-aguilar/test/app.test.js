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
const { createStore } = require('../src/store/welds.store');

const json = async (path) => (await get(path)).json();
const weld = { process: 'FCAW', material: 'Acero', thicknessMm: 8, amperage: 250 };

test('GET /basico/ejercicio-23', async () => {
  assert.equal((await json('/basico/ejercicio-23')).topic, 'datos en memoria');
});

test('el store genera ids y no comparte referencias', () => {
  const store = createStore([{ id: 1, name: 'a' }]);
  const created = store.insert({ name: 'b' });
  assert.equal(created.id, 2);
  created.name = 'modificado desde fuera';
  assert.equal(store.find(2).name, 'b');
  store.reset();
  assert.equal(store.all().length, 1);
});

test('POST /welds guarda en memoria y GET lo recupera', async () => {
  const res = await send('POST', '/welds', weld);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.weld.id, 4);
  assert.equal(body.weld.material, 'acero');
  assert.equal(body.weld.status, 'pendiente');
  assert.equal((await json('/welds/4')).weld.process, 'FCAW');
});

test('los datos persisten entre peticiones, no entre reinicios', async () => {
  assert.equal((await json('/welds')).total, 4);
  await send('POST', '/admin/reset');
  assert.equal((await json('/welds')).total, 3);
  assert.equal((await get('/welds/4')).status, 404);
});

test('GET /welds filtra y valida', async () => {
  assert.equal((await json('/welds?process=MIG')).total, 1);
  assert.equal((await json('/welds?status=pendiente&process=TIG')).total, 1);
  assert.equal((await get('/welds?process=LASER')).status, 400);
});

test('GET /welds/stats va antes de /:id y agrega datos', async () => {
  const { stats } = await json('/welds/stats');
  assert.equal(stats.total, 3);
  assert.equal(stats.byStatus.aprobada, 1);
  assert.equal(stats.averageAmperage, 173.3);
});

test('validaciones', async () => {
  const bad = await send('POST', '/welds', { process: 'X', thicknessMm: -1, amperage: 5 });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).details.length, 4);
  assert.equal((await get('/welds/abc')).status, 400);
  assert.equal((await get('/welds/99')).status, 404);
});
