const test = require('node:test');
const assert = require('node:assert/strict');
const { createPlayer } = require('../src/factory');

test('crea un jugador con rango inicial', () => {
  assert.deepEqual(createPlayer('Nova'), { name: 'Nova', rank: 'Bronze' });
});

test('permite definir un rango', () => {
  assert.deepEqual(createPlayer('Rex', 'Gold'), { name: 'Rex', rank: 'Gold' });
});
