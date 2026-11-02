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

const login = async (email, password) => {
  const res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return (await res.json()).token;
};

test('GET /api/workorders es público y pagina', async () => {
  const res = await fetch(base + '/api/workorders?limit=2');
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.data.length, 2);
  assert.equal(body.meta.total, 3);
  assert.ok(res.headers.get('x-request-id'));
});

test('GET /api/workorders filtra por status', async () => {
  const res = await fetch(base + '/api/workorders?status=Listo');
  const body = await res.json();
  assert.equal(body.data.length, 1);
});

test('POST sin token responde 401', async () => {
  const res = await fetch(base + '/api/workorders', { method: 'POST' });
  assert.equal(res.status, 401);
});

test('POST con rol user responde 403', async () => {
  const token = await login('user@demo.com', 'user123');
  const res = await fetch(base + '/api/workorders', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
  assert.equal(res.status, 403);
});

test('POST con admin y datos inválidos responde 400', async () => {
  const token = await login('admin@demo.com', 'admin123');
  const res = await fetch(base + '/api/workorders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ motorcycle: 'Ducati' })
  });
  assert.equal(res.status, 400);
});

test('POST con admin crea la orden (201)', async () => {
  const token = await login('admin@demo.com', 'admin123');
  const res = await fetch(base + '/api/workorders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ motorcycle: 'Ducati Monster', service: 'Revisión', costUsd: 80 })
  });
  assert.equal(res.status, 201);
});
