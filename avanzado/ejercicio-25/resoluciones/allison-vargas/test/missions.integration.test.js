import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API de misiones RPG', () => {
  const app = createApp();
  let missionId;

  it('expone el estado del servicio', async () => {
    const response = await request(app).get('/health').expect(200);
    assert.deepEqual(response.body, { status: 'ok' });
  });

  it('crea una misión válida y la devuelve en el listado', async () => {
    const created = await request(app).post('/api/missions').send({ title: 'Explorar ruinas', region: 'Valle Norte', level: 4, reward: 250 }).expect(201);
    missionId = created.body.data.id;
    assert.equal(created.body.data.status, 'pending');
    const listed = await request(app).get('/api/missions').expect(200);
    assert.equal(listed.body.data[0].id, missionId);
  });

  it('rechaza datos inválidos', async () => {
    const response = await request(app).post('/api/missions').send({ title: '', region: 'Valle', level: 0, reward: -1 }).expect(400);
    assert.match(response.body.error, /título/);
  });

  it('completa la misión y evita completarla dos veces', async () => {
    const response = await request(app).patch(`/api/missions/${missionId}/complete`).expect(200);
    assert.equal(response.body.data.status, 'completed');
    await request(app).patch(`/api/missions/${missionId}/complete`).expect(409);
  });

  it('responde 404 para misiones ausentes y rutas desconocidas', async () => {
    await request(app).patch('/api/missions/unknown/complete').expect(404);
    await request(app).get('/missing').expect(404);
  });
});
