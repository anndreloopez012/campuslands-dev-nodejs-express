import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

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

test('GET /intermedio/ejercicio-25 - debe retornar status 200 y topic correspondiente', async () => {
  const response = await fetch(`${baseUrl}/intermedio/ejercicio-25`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.topic, 'testing de rutas');
});

test('GET /api/rpg/dungeons - debe listar mazmorras con status 200', async () => {
  const response = await fetch(`${baseUrl}/api/rpg/dungeons`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.total >= 2);
});

test('POST /api/rpg/dungeons - caso exitoso: debe crear mazmorra con status 201', async () => {
  const payload = { nombre: 'Torre de las Sombras', nivelRecomendado: 30 };
  const response = await fetch(`${baseUrl}/api/rpg/dungeons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.data.nombre, 'Torre de las Sombras');
});

test('POST /api/rpg/dungeons - caso error: 400 Bad Request si faltan datos obligatorios', async () => {
  const response = await fetch(`${baseUrl}/api/rpg/dungeons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Incompleto' })
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
});
