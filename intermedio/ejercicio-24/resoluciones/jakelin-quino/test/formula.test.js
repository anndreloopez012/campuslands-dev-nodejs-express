const test = require('node:test');
const assert = require('node:assert/strict');
const { molarMass } = require('../src/formula');

test('calcula el agua', () => {
  assert.equal(molarMass('H2O'), 18.015);
});

test('rechaza fórmulas inválidas', () => {
  assert.throws(() => molarMass('H2O!'), /no válida/);
});
