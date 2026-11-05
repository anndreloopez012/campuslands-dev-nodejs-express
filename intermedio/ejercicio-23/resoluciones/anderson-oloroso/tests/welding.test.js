import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCalorAportado } from '../src/services/weldingCalculator.service.js';

describe('Pruebas unitarias con node:test - Cálculo de soldadura', () => {
  test('Debe calcular el calor aportado (heat input) correctamente', () => {
    const resultado = calcularCalorAportado({ voltaje: 20, amperaje: 150, velocidadAvanceMmS: 5, eficiencia: 0.8 });
    assert.equal(resultado.heatInputKJPorMm, 0.48);
  });

  test('Debe lanzar error si algún parámetro es menor o igual a cero', () => {
    assert.throws(() => {
      calcularCalorAportado({ voltaje: -10, amperaje: 100, velocidadAvanceMmS: 5 });
    }, /mayores a cero/);
  });
});
