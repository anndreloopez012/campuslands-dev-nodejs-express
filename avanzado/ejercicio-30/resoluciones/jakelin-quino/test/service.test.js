const test = require('node:test');
const assert = require('node:assert/strict');
const { nextServiceKm } = require('../src/service');

test('calcula el próximo mantenimiento cada 5000 km', () => {
  assert.equal(nextServiceKm(5000), 10000);
  assert.equal(nextServiceKm(5001), 10000);
  assert.equal(nextServiceKm(0), 5000);
});
