const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Archivo temporal: las pruebas no tocan src/data/fighters.json
const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'fighters-')), 'fighters.json');
fs.copyFileSync(path.join(__dirname, '..', 'src', 'data', 'fighters.json'), tmpFile);
process.env.FIGHTERS_FILE = tmpFile;

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

const get = (p) => fetch(base + p);
const post = (body, raw = false) =>
  fetch(`${base}/fighters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ? body : JSON.stringify(body),
  });

const valid = { name: 'Ana Solis', weightClass: 'peso gallo', wins: 5, losses: 0 };

test('GET /basico/ejercicio-09', async () => {
  const body = await (await get('/basico/ejercicio-09')).json();
  assert.equal(body.topic, 'JSON y persistencia simple');
});

test('POST /fighters guarda en el archivo JSON', async () => {
  const res = await post(valid);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.fighter.id, 3);

  const stored = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
  assert.equal(stored.length, 3);
  assert.equal((await get('/fighters/3')).status, 200);
});

test('POST /fighters rechaza duplicados (409) y datos invalidos (400)', async () => {
  assert.equal((await post(valid)).status, 409);
  const res = await post({ name: 'x', wins: -1 });
  const body = await res.json();
  assert.equal(res.status, 400);
  assert.ok(body.details.length >= 3);
  assert.equal((await post('{malo', true)).status, 400);
});

test('escrituras simultaneas no se pierden', async () => {
  const names = ['Uno Test', 'Dos Test', 'Tres Test', 'Cuatro Test'];
  await Promise.all(names.map((name) => post({ ...valid, name })));
  const body = await (await get('/fighters')).json();
  assert.equal(body.total, 3 + names.length);
});

test('GET /fighters/:id valida y maneja errores', async () => {
  assert.equal((await get('/fighters/999')).status, 404);
  assert.equal((await get('/fighters/abc')).status, 400);
});
