import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calcularMasaMolecular } from '../src/services/chemistry.service.js';

describe('Suite de pruebas de servicio químico (node:test)', () => {
  test('Debe calcular la masa molecular del agua H2O correctamente', () => {
    const res = calcularMasaMolecular('H2O');
    assert.equal(res.masaMolecularGmol, 18.015);
  });

  test('Debe calcular la masa del CO2', () => {
    const res = calcularMasaMolecular('CO2');
    assert.equal(res.masaMolecularGmol, 44.009);
  });

  test('Debe lanzar error ante fórmula no soportada', () => {
    assert.throws(() => calcularMasaMolecular('C6H12O6'), /no soportada/);
  });
});
