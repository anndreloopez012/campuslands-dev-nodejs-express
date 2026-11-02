import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let base;

before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    base = 'http://localhost:' + server.address().port;
    resolve();
  });
}));

after(() => server.close());

test('GET /api/characters responde 200 con la lista', async () => {
  const res = await fetch(base + '/api/characters');
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.data.length, 2);
});

test('GET /api/characters/:id devuelve 404 si no existe', async () => {
  const res = await fetch(base + '/api/characters/99');
  assert.equal(res.status, 404);
});

test('POST /api/characters valida el body (400)', async () => {
  const res = await fetch(base + '/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Sin clase' })
  });
  assert.equal(res.status, 400);
});

test('POST /api/characters crea un personaje (201)', async () => {
  const res = await fetch(base + '/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Legolas', class: 'Arquero', level: 30 })
  });
  const body = await res.json();

  assert.equal(res.status, 201);
  assert.equal(body.data.name, 'Legolas');
});
