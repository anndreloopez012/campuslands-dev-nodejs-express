const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createLogger } = require('../src/utils/logger');

const FIXED_DATE = new Date('2026-10-03T16:20:00.000Z');

// --- Logger (unidad) ---
test('el logger formatea: fecha ISO, nivel y mensaje', () => {
  const lines = [];
  const logger = createLogger({ level: 'info', write: (line) => lines.push(line), now: () => FIXED_DATE });
  logger.info('Servidor listo');
  logger.warn('Cuidado', { disco: '91%' });
  assert.equal(lines[0], '2026-10-03T16:20:00.000Z INFO  Servidor listo');
  assert.equal(lines[1], '2026-10-03T16:20:00.000Z WARN  Cuidado {"disco":"91%"}');
});

test('el logger respeta el nivel minimo', () => {
  const lines = [];
  const logger = createLogger({ level: 'warn', write: (line) => lines.push(line) });
  logger.debug('no sale');
  logger.info('no sale');
  logger.warn('sale');
  logger.error('sale');
  assert.equal(lines.length, 2);
});

test('el logger oculta datos sensibles, tambien anidados', () => {
  const lines = [];
  const logger = createLogger({ level: 'debug', write: (line) => lines.push(line) });
  logger.info('login', { user: 'ana', password: '1234', datos: { apiKey: 'abc', token: 'xyz' } });
  assert.doesNotMatch(lines[0], /1234|abc|xyz/);
  assert.match(lines[0], /\[REDACTED\]/);
  assert.match(lines[0], /"user":"ana"/);
});

test('un nivel invalido lanza error', () => {
  assert.throws(() => createLogger({ level: 'ruidoso' }), /LOG_LEVEL invalido/);
});

// --- Aplicacion (integracion) ---
let server;
let base;
let lines;

before(
  () =>
    new Promise((resolve) => {
      lines = [];
      const logger = createLogger({ level: 'debug', write: (line, level) => lines.push({ line, level }) });
      server = createApp({ logger }).listen(0, () => {
        base = `http://localhost:${server.address().port}`;
        resolve();
      });
    })
);
after(() => server.close());
beforeEach(() => {
  lines.length = 0;
});

const call = async (method, path, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await res.text();
  await new Promise((resolve) => setTimeout(resolve, 25)); // deja que se emita 'finish'
  return res;
};
const texts = () => lines.map((entry) => entry.line);

test('GET /basico/ejercicio-27', async () => {
  const res = await fetch(`${base}/basico/ejercicio-27`);
  assert.equal((await res.json()).topic, 'logs simples');
});

test('cada peticion deja una linea con metodo, ruta, estado y duracion', async () => {
  await call('GET', '/heroes');
  assert.match(texts().at(-1), /INFO\s+GET \/heroes 200 \d+\.\dms$/);
});

test('el nivel depende del resultado: 4xx -> WARN, 5xx -> ERROR', async () => {
  await call('GET', '/heroes/99');
  assert.match(texts().at(-1), /WARN\s+GET \/heroes\/99 404/);
  assert.equal(lines.at(-1).level, 'warn');
});

test('eventos de negocio: partida registrada e invalida', async () => {
  await call('POST', '/matches', { mode: 'ranked', durationMin: 32, winner: 'azul' });
  assert.ok(texts().some((line) => /INFO\s+Partida registrada \{"id":1,"mode":"ranked"/.test(line)));

  lines.length = 0;
  const res = await call('POST', '/matches', { mode: 'cualquiera' });
  assert.equal(res.status, 400);
  assert.ok(texts().some((line) => /WARN\s+Partida rechazada/.test(line)));
});

test('la contrasena nunca aparece en los logs', async () => {
  await call('POST', '/auth/demo', { user: 'ana', password: 'super-secreta' });
  const all = texts().join('\n');
  assert.doesNotMatch(all, /super-secreta/);
  assert.match(all, /Intento de login \{"user":"ana","password":"\[REDACTED\]"\}/);
});

test('un error inesperado: 500 al cliente sin detalles, y ERROR con stack en el log', async () => {
  const res = await call('GET', '/boom');
  const body = await res.json().catch(() => null);
  assert.equal(res.status, 500);
  assert.equal(body, null); // cuerpo ya consumido en call(); lo importante es el log
  const errorLines = lines.filter((entry) => entry.level === 'error').map((entry) => entry.line);
  assert.ok(errorLines.some((line) => /Error no controlado: Fallo simulado del servidor/.test(line)));
  assert.ok(errorLines.some((line) => /GET \/boom 500/.test(line)));
});
