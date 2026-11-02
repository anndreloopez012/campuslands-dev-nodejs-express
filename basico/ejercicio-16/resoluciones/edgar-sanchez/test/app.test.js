import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test('GET / devuelve la respuesta principal del ejercicio', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    exercise: {
      number: 16,
      title: 'BASICO 16 - primer servidor Express',
      topic: 'primer servidor Express',
      theme: 'ropa y sneakers',
    },
    developer: 'Edgar Sánchez',
  });
});

test('GET /health informa que el servicio está activo', async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    status: 'up',
    service: 'basico-16-api',
  });
});

test('Una ruta inexistente devuelve 404 en formato JSON', async () => {
  const response = await fetch(`${baseUrl}/no-existe`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    ok: false,
    error: {
      status: 404,
      message: 'Ruta no encontrada: GET /no-existe',
    },
  });
});

test('El servidor rechaza un cuerpo JSON no válido', async () => {
  const response = await fetch(`${baseUrl}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: '{invalid-json}',
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    ok: false,
    error: {
      status: 400,
      message: 'El cuerpo de la solicitud contiene JSON no válido.',
    },
  });
});