import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createWeaponsService } from '../src/services/weapons.service.js';

test('getStrongest devuelve el arma con más daño', () => {
  const repo = { findAll: mock.fn(() => [{ id: 1, damage: 10 }, { id: 2, damage: 99 }]) };
  const service = createWeaponsService(repo);

  assert.equal(service.getStrongest().id, 2);
  assert.equal(repo.findAll.mock.callCount(), 1);
});

test('getStrongest falla si no hay armas', () => {
  const service = createWeaponsService({ findAll: () => [] });
  assert.throws(() => service.getStrongest(), /No hay armas/);
});

test('getDps calcula el daño por segundo', () => {
  const repo = { findById: mock.fn(() => ({ name: 'Mock', damage: 20, fireRate: 2.5 })) };
  const service = createWeaponsService(repo);

  assert.deepEqual(service.getDps(1), { name: 'Mock', dps: 50 });
  assert.deepEqual(repo.findById.mock.calls[0].arguments, [1]);
});

test('getDps falla si el arma no existe', () => {
  const service = createWeaponsService({ findById: () => undefined });
  assert.throws(() => service.getDps(99), /no encontrada/);
});
