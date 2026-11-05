import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /intermedio/ejercicio-30 - debe incluir topic y X-Request-Id', async () => {
  const res = await fetch(`${baseUrl}/intermedio/ejercicio-30`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.topic, 'proyecto integrador intermedio');
  assert.ok(res.headers.get('x-request-id'));
});

test('POST /api/workshop/records - éxito con validación', async () => {
  const payload = {
    placa: 'SUZ-600',
    cliente: 'Andrés Morales',
    marca: 'Suzuki',
    modelo: 'GSX-R600',
    cilindrada: 599,
    tipoMantenimiento: 'preventivo',
    costoUSD: 140
  };

  const res = await fetch(`${baseUrl}/api/workshop/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.data.placa, 'SUZ-600');
});

test('POST /api/workshop/records - fallo 400 por campos faltantes', async () => {
  const res = await fetch(`${baseUrl}/api/workshop/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placa: 'X' })
  });
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.ok, false);
});
