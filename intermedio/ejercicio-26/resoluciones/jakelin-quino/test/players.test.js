const test = require('node:test');
const assert = require('node:assert/strict');
const { listPlayers } = require('../src/players');

test('usa el repositorio inyectado', () => {
  const mockRepository = { findAll: () => [{ name: 'Test' }] };
  assert.deepEqual(listPlayers(mockRepository), [{ name: 'Test' }]);
});
