const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config');
const { createApp } = require('../src/app');

// --- loadConfig (unidad) ---
test('cada entorno tiene su perfil por defecto', () => {
  const dev = loadConfig({});
  assert.deepEqual([dev.env, dev.port, dev.logLevel, dev.maxPlayersPerMatch, dev.debugRoutes], ['development', 3000, 'debug', 20, true]);

  const test_ = loadConfig({ NODE_ENV: 'test' });
  assert.deepEqual([test_.env, test_.maxPlayersPerMatch], ['test', 4]);

  const prod = loadConfig({ NODE_ENV: 'production', API_KEY: 'k' });
  assert.deepEqual([prod.env, prod.port, prod.logLevel, prod.maxPlayersPerMatch, prod.debugRoutes], ['production', 8080, 'info', 100, false]);
});

test('las variables de entorno sobrescriben el perfil', () => {
  const config = loadConfig({ NODE_ENV: 'development', PORT: '4500', LOG_LEVEL: 'warn', MAX_PLAYERS: '12' });
  assert.deepEqual([config.port, config.logLevel, config.maxPlayersPerMatch], [4500, 'warn', 12]);
});

test('production exige API_KEY (fail fast)', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production' }), /API_KEY/);
});

test('valores invalidos lanzan errores claros', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'staging' }), /NODE_ENV invalido/);
  assert.throws(() => loadConfig({ PORT: 'abc' }), /PORT/);
  assert.throws(() => loadConfig({ PORT: '70000' }), /PORT/);
  assert.throws(() => loadConfig({ LOG_LEVEL: 'ruidoso' }), /LOG_LEVEL/);
  assert.throws(() => loadConfig({ MAX_PLAYERS: '0' }), /MAX_PLAYERS/);
});

test('la configuracion es inmutable', () => {
  const config = loadConfig({});
  assert.throws(() => {
    'use strict';
    config.port = 1;
  }, TypeError);
});

// --- Aplicacion segun el entorno (integracion) ---
const servers = [];
async function start(env) {
  const server = createApp(loadConfig(env)).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  servers.push(server);
  return `http://localhost:${server.address().port}`;
}
after(() => servers.forEach((server) => server.close()));

const post = (base, body) =>
  fetch(`${base}/matches/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('GET /basico/ejercicio-28 informa el entorno', async () => {
  const base = await start({ NODE_ENV: 'test' });
  const body = await (await fetch(`${base}/basico/ejercicio-28`)).json();
  assert.equal(body.topic, 'configuracion por entorno');
  assert.equal(body.environment, 'test');
});

test('el limite de jugadores depende del entorno', async () => {
  const testBase = await start({ NODE_ENV: 'test' });
  assert.equal((await post(testBase, { players: 4 })).status, 201);
  assert.equal((await post(testBase, { players: 5 })).status, 422);

  const prodBase = await start({ NODE_ENV: 'production', API_KEY: 'k' });
  assert.equal((await post(prodBase, { players: 5 })).status, 201);
  assert.equal((await post(prodBase, { players: 101 })).status, 422);
  assert.equal((await post(prodBase, { players: 0 })).status, 400);
});

test('las rutas de depuracion solo existen fuera de production', async () => {
  const devBase = await start({ NODE_ENV: 'development' });
  assert.equal((await fetch(`${devBase}/debug/profile`)).status, 200);

  const prodBase = await start({ NODE_ENV: 'production', API_KEY: 'k' });
  assert.equal((await fetch(`${prodBase}/debug/profile`)).status, 404);
});

test('/config no expone la API key', async () => {
  const base = await start({ NODE_ENV: 'production', API_KEY: 'clave-ultra-secreta' });
  const text = await (await fetch(`${base}/config`)).text();
  assert.doesNotMatch(text, /clave-ultra-secreta/);
  assert.match(text, /"apiKeyConfigured":true/);
});
