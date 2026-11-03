const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createLogger } = require('../src/utils/logger');
const { loadConfig } = require('../src/config');

let server;
let base;
const logs = [];

before(
  () =>
    new Promise((resolve) => {
      const logger = createLogger({ level: 'debug', write: (line) => logs.push(line) });
      server = createApp({ logger }).listen(0, () => {
        base = `http://localhost:${server.address().port}`;
        resolve();
      });
    })
);
after(() => server.close());

const call = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const json = async (method, path, body) => (await call(method, path, body)).json();

const newMoto = { brand: 'Suzuki', model: 'GN125', year: 2020, displacementCc: 125, plate: 'm789ghi' };

test('config: valores por defecto y validacion', () => {
  assert.deepEqual({ ...loadConfig({}) }, { port: 3000, nodeEnv: 'development', logLevel: 'info' });
  assert.throws(() => loadConfig({ PORT: 'x' }), /PORT/);
  assert.throws(() => loadConfig({ LOG_LEVEL: 'ruido' }), /LOG_LEVEL/);
});

test('GET /basico/ejercicio-30 y /health', async () => {
  assert.equal((await json('GET', '/basico/ejercicio-30')).topic, 'proyecto integrador basico');
  assert.equal((await json('GET', '/health')).status, 'up');
});

test('motocicletas: crear, normaliza la placa, listar y filtrar', async () => {
  const res = await call('POST', '/motorcycles', newMoto);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(res.headers.get('location'), '/motorcycles/3');
  assert.equal(body.motorcycle.plate, 'M789GHI');

  assert.equal((await json('GET', '/motorcycles')).total, 3);
  assert.equal((await json('GET', '/motorcycles?brand=honda')).total, 1);
});

test('motocicletas: validacion (400), placa repetida (409), 404 e id invalido', async () => {
  const bad = await call('POST', '/motorcycles', { brand: 'X', year: 1900 });
  const body = await bad.json();
  assert.equal(bad.status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.equal(body.error.details.length, 5);

  assert.equal((await call('POST', '/motorcycles', newMoto)).status, 409);
  assert.equal((await call('GET', '/motorcycles/99')).status, 404);
  assert.equal((await call('GET', '/motorcycles/abc')).status, 400);
});

test('motocicletas: PUT reemplaza y respeta la unicidad', async () => {
  const updated = await json('PUT', '/motorcycles/3', { ...newMoto, model: 'GN125H' });
  assert.equal(updated.motorcycle.model, 'GN125H');
  assert.equal((await call('PUT', '/motorcycles/3', { ...newMoto, plate: 'M123ABC' })).status, 409);
  assert.equal((await call('PUT', '/motorcycles/99', newMoto)).status, 404);
});

test('ordenes: crear valida referencia (422) y datos (400)', async () => {
  const ok = await call('POST', '/orders', { motorcycleId: 1, description: 'Cambio de aceite y filtro', estimatedCostUsd: 35 });
  assert.equal(ok.status, 201);
  assert.equal(ok.headers.get('location'), '/orders/1');
  assert.equal((await ok.json()).order.status, 'pendiente');

  const ghost = await call('POST', '/orders', { motorcycleId: 99, description: 'Revision general', estimatedCostUsd: 10 });
  assert.equal(ghost.status, 422);
  assert.equal((await ghost.json()).error.code, 'INVALID_REFERENCE');

  assert.equal((await call('POST', '/orders', { motorcycleId: 'uno', description: 'x', estimatedCostUsd: -1 })).status, 400);
});

test('ordenes: el estado solo avanza en orden y finalizar exige el costo final', async () => {
  assert.equal((await call('PATCH', '/orders/1/status', { status: 'finalizada', finalCostUsd: 40 })).status, 409); // se salta un paso
  assert.equal((await call('PATCH', '/orders/1/status', { status: 'otro' })).status, 400);

  assert.equal((await json('PATCH', '/orders/1/status', { status: 'en_proceso' })).order.status, 'en_proceso');
  assert.equal((await call('PATCH', '/orders/1/status', { status: 'finalizada' })).status, 400); // falta finalCostUsd

  const done = await json('PATCH', '/orders/1/status', { status: 'finalizada', finalCostUsd: 42.5 });
  assert.equal(done.order.finalCostUsd, 42.5);
  assert.equal((await call('PATCH', '/orders/1/status', { status: 'en_proceso' })).status, 409); // ya no admite cambios
});

test('listados: /orders?status y /motorcycles/:id/orders', async () => {
  assert.equal((await json('GET', '/orders?status=finalizada')).total, 1);
  assert.equal((await json('GET', '/orders?status=pendiente')).total, 0);
  assert.equal((await call('GET', '/orders?status=rara')).status, 400);
  assert.equal((await json('GET', '/motorcycles/1/orders')).total, 1);
  assert.equal((await call('GET', '/motorcycles/99/orders')).status, 404);
});

test('no se elimina una moto con ordenes abiertas (409), si sin ellas (204)', async () => {
  await call('POST', '/orders', { motorcycleId: 2, description: 'Ajuste de cadena y frenos', estimatedCostUsd: 20 });
  assert.equal((await call('DELETE', '/motorcycles/2')).status, 409);

  const res = await call('DELETE', '/motorcycles/3');
  assert.equal(res.status, 204);
  assert.equal((await call('GET', '/motorcycles/3')).status, 404);
});

test('GET /stats suma ingresos de ordenes finalizadas', async () => {
  const { stats } = await json('GET', '/stats');
  assert.deepEqual(stats, { totalOrders: 2, byStatus: { pendiente: 1, en_proceso: 0, finalizada: 1 }, revenueUsd: 42.5 });
});

test('JSON roto -> 400 y ruta inexistente -> 404 con el mismo formato', async () => {
  const broken = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{roto' });
  assert.equal((await broken.json()).error.code, 'INVALID_JSON');
  const missing = await call('GET', '/nada');
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'NOT_FOUND');
});

test('el logger registro las peticiones con su nivel', () => {
  assert.ok(logs.some((line) => /INFO\s+GET \/motorcycles 200/.test(line)));
  assert.ok(logs.some((line) => /WARN\s+GET \/motorcycles\/99 404/.test(line)));
});
