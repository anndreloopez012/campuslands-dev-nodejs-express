import test from 'node:test';
import assert from 'node:assert/strict';
import { getMolarMass } from '../src/services/chemistryService.js';

test('devuelve la masa molar del agua', () => {
  assert.equal(getMolarMass('H2O'), 18.015);
});

test('informa cuando la fórmula no está registrada', () => {
  assert.throws(() => getMolarMass('XYZ'), /no incluida/);
});
