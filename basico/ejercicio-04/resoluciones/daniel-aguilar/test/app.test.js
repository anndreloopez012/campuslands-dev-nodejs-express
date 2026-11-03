import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

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

test('GET /basico/ejercicio-04', async () => {
  const body = await (await fetch(`${base}/basico/ejercicio-04`)).json();
  assert.equal(body.topic, 'modulos ES Modules');
});

test('GET /maps lee los datos del JSON', async () => {
  const body = await (await fetch(`${base}/maps`)).json();
  assert.equal(body.maps.length, 3);
});

test('GET /maps/:id valida y maneja errores', async () => {
  assert.equal((await fetch(`${base}/maps/2`)).status, 200);
  assert.equal((await fetch(`${base}/maps/99`)).status, 404);
  assert.equal((await fetch(`${base}/maps/x`)).status, 400);
});
