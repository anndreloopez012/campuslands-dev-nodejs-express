import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, molarMass } from '../src/services/formulas.service.js';

test('parseFormula cuenta los átomos', () => {
  assert.deepEqual(parseFormula('H2O'), { H: 2, O: 1 });
  assert.deepEqual(parseFormula('C6H12O6'), { C: 6, H: 12, O: 6 });
});

test('parseFormula rechaza texto inválido', () => {
  assert.throws(() => parseFormula('h2o'), /inválida/);
  assert.throws(() => parseFormula(''), /inválida/);
});

test('molarMass calcula la masa molar', () => {
  assert.equal(molarMass('H2O'), 18.015);
  assert.equal(molarMass('NaCl'), 58.44);
});

test('molarMass rechaza elementos desconocidos', () => {
  assert.throws(() => molarMass('Xx2'), /desconocido/);
});
