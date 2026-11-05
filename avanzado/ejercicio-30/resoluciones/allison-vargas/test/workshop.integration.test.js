import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApp } from '../src/app.js';

describe('API del taller de motos', () => {
  it('gestiona motocicletas y el ciclo de una orden de mantenimiento', async () => {
    const server = createApp().listen(0);
    try {
      const base = `http://127.0.0.1:${server.address().port}`;
      const motorcycleResponse = await fetch(`${base}/api/motorcycles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ plate: 'moto-104', make: 'Honda', model: 'CB500', year: 2024 }) });
      assert.equal(motorcycleResponse.status, 201);
      const motorcycle = (await motorcycleResponse.json()).data;
      assert.equal(motorcycle.plate, 'MOTO-104');
      const orderResponse = await fetch(`${base}/api/work-orders`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ motorcycleId: motorcycle.id, description: 'Cambio de aceite', estimatedCost: 350 }) });
      assert.equal(orderResponse.status, 201);
      const order = (await orderResponse.json()).data;
      const started = await fetch(`${base}/api/work-orders/${order.id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'in_progress' }) });
      assert.equal((await started.json()).data.status, 'in_progress');
      const completed = await fetch(`${base}/api/work-orders/${order.id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) });
      assert.equal((await completed.json()).data.status, 'completed');
      const invalidTransition = await fetch(`${base}/api/work-orders/${order.id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'pending' }) });
      assert.equal(invalidTransition.status, 409);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it('rechaza placas duplicadas y datos inválidos con errores uniformes', async () => {
    const server = createApp().listen(0);
    try {
      const url = `http://127.0.0.1:${server.address().port}/api/motorcycles`;
      const payload = JSON.stringify({ plate: 'GT-901', make: 'Yamaha', model: 'FZ', year: 2023 });
      await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
      const duplicate = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
      assert.equal(duplicate.status, 409);
      assert.equal((await duplicate.json()).error.code, 'PLATE_EXISTS');
      const invalid = await fetch(`${url}?page=0`);
      assert.equal(invalid.status, 400);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
