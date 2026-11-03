import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWeldEstimate } from '../src/services/weldService.js';

test('calcula el material estimado para medidas válidas', () => {
  assert.equal(calculateWeldEstimate(20, 3), 48);
});

test('rechaza medidas no positivas', () => {
  assert.throws(() => calculateWeldEstimate(0, 3), /números positivos/);
});
