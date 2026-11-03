const test = require('node:test');
const assert = require('node:assert/strict');
const { weldArea } = require('../src/weld');

test('calcula el área de la soldadura', () => {
  assert.equal(weldArea(2, 5), 10);
});

test('rechaza medidas no positivas', () => {
  assert.throws(() => weldArea(0, 5), /positivas/);
});
