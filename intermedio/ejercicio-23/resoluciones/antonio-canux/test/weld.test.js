import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendedAmperage } from '../src/utils/weld.js';

test('calcula el amperaje para 3 mm', () => {
  assert.equal(recommendedAmperage(3), 120);
});

test('redondea el resultado', () => {
  assert.equal(recommendedAmperage(2.55), 102);
});

test('lanza error con espesor inválido', () => {
  assert.throws(() => recommendedAmperage(-1), /positivo/);
  assert.throws(() => recommendedAmperage('3'), /positivo/);
  assert.throws(() => recommendedAmperage(NaN), /positivo/);
});
