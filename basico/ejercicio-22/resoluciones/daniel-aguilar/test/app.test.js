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
const service = require('../src/services/projects.service');

const json = async (path) => (await get(path)).json();

// --- Pruebas del SERVICIO: no hace falta servidor, req ni res ---
test('estimateRender aplica la formula de negocio', () => {
  const project = { id: 1, polygons: 200000, lights: 5 };
  assert.equal(service.estimateRender(project, 'standard').minutes, 3); // 2 * 1 * 1.5
  assert.equal(service.estimateRender(project, 'draft').minutes, 2); // 2 * 0.5 * 1.5 = 1.5 -> 2
  assert.equal(service.estimateRender(project, 'high').minutes, 8); // 2 * 2.5 * 1.5 = 7.5 -> 8
});

test('el servicio lanza errores con status', () => {
  assert.throws(() => service.getProject(999), { status: 404 });
  assert.throws(() => service.estimateRender({ polygons: 1000, lights: 0 }, 'ultra'), { status: 400 });
  assert.throws(() => service.createProject({}), { status: 400 });
});

// --- Pruebas HTTP: el controlador solo traduce ---
test('GET /basico/ejercicio-22', async () => {
  assert.equal((await json('/basico/ejercicio-22')).topic, 'servicios simples');
});

test('GET /projects/:id/render-estimate', async () => {
  const body = await json('/projects/1/render-estimate?quality=high');
  // 2.4 * 2.5 * 1.6 = 9.6 -> 10
  assert.equal(body.estimate.minutes, 10);
  assert.equal((await json('/projects/1/render-estimate')).estimate.quality, 'standard');
  assert.equal((await get('/projects/1/render-estimate?quality=ultra')).status, 400);
  assert.equal((await get('/projects/99/render-estimate')).status, 404);
});

test('GET /summary agrega datos', async () => {
  const { summary } = await json('/summary');
  assert.equal(summary.totalProjects, 3);
  assert.equal(summary.totalPolygons, 2090000);
  assert.equal(summary.byType.residencial, 1);
});

test('POST /projects crea y valida', async () => {
  const ok = await send('POST', '/projects', { name: 'Museo Norte', type: 'comercial', polygons: 800000, lights: 12 });
  assert.equal(ok.status, 201);
  const bad = await send('POST', '/projects', { name: '', type: 'otro', polygons: 5, lights: -1 });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).details.length, 4);
  assert.equal((await get('/projects/abc')).status, 400);
});
