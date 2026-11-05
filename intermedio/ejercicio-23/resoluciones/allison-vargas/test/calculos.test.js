import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcular,
  calcularCalorAporte,
  clasificarCalor,
  evaluar,
  revisarRangos,
} from '../src/services/calculos.service.js';
import { ValidationError } from '../src/utils/errors.js';

describe('calcularCalorAporte', () => {
  const casos = [
    { nombre: 'MIG', datos: { proceso: 'mig', voltaje: 24, amperaje: 200, velocidadMmMin: 300 }, esperado: 0.768 },
    { nombre: 'TIG', datos: { proceso: 'tig', voltaje: 12, amperaje: 120, velocidadMmMin: 120 }, esperado: 0.432 },
    { nombre: 'electrodo', datos: { proceso: 'electrodo', voltaje: 25, amperaje: 150, velocidadMmMin: 200 }, esperado: 0.9 },
    { nombre: 'arco sumergido', datos: { proceso: 'arcosumergido', voltaje: 32, amperaje: 600, velocidadMmMin: 400 }, esperado: 2.88 },
  ];

  for (const { nombre, datos, esperado } of casos) {
    it(`calcula el aporte de calor para ${nombre}`, () => {
      assert.equal(calcularCalorAporte(datos), esperado);
    });
  }

  it('baja el aporte cuando aumenta la velocidad', () => {
    const base = { proceso: 'mig', voltaje: 24, amperaje: 200 };
    const lento = calcularCalorAporte({ ...base, velocidadMmMin: 200 });
    const rapido = calcularCalorAporte({ ...base, velocidadMmMin: 400 });
    assert.ok(rapido < lento);
    assert.equal(lento, rapido * 2);
  });

  it('rechaza un proceso desconocido', () => {
    assert.throws(
      () => calcularCalorAporte({ proceso: 'laser', voltaje: 20, amperaje: 100, velocidadMmMin: 100 }),
      { name: 'RangeError', message: /Proceso desconocido: laser/ },
    );
  });

  it('rechaza una velocidad que no sea mayor que cero', () => {
    assert.throws(
      () => calcularCalorAporte({ proceso: 'mig', voltaje: 20, amperaje: 100, velocidadMmMin: 0 }),
      RangeError,
    );
  });
});

describe('clasificarCalor', () => {
  const limites = [
    [0.1, 'bajo'],
    [0.8, 'bajo'],
    [0.801, 'medio'],
    [1.8, 'medio'],
    [1.801, 'alto'],
    [3, 'alto'],
  ];

  for (const [valor, esperado] of limites) {
    it(`${valor} kJ/mm es ${esperado}`, () => {
      assert.equal(clasificarCalor(valor), esperado);
    });
  }
});

describe('revisarRangos', () => {
  it('no devuelve errores cuando los valores estan dentro del proceso', () => {
    assert.deepEqual(revisarRangos({ proceso: 'mig', voltaje: 24, amperaje: 200 }), []);
  });

  it('senala voltaje y amperaje fuera de rango', () => {
    const detalles = revisarRangos({ proceso: 'tig', voltaje: 30, amperaje: 400 });
    assert.deepEqual(detalles.map((item) => item.campo), ['voltaje', 'amperaje']);
    assert.match(detalles[0].mensaje, /TIG/);
  });

  it('acepta los valores justo en el limite', () => {
    assert.deepEqual(revisarRangos({ proceso: 'tig', voltaje: 8, amperaje: 300 }), []);
  });
});

describe('evaluar', () => {
  const parametros = { proceso: 'arcosumergido', voltaje: 32, amperaje: 600, velocidadMmMin: 400 };

  it('marca dentroDeLimite en acero al carbono', () => {
    const resultado = evaluar({ ...parametros, material: 'acero_carbono' });
    assert.equal(resultado.dentroDeLimite, true);
    assert.equal(resultado.clasificacion, 'alto');
    assert.equal(resultado.limiteKjMm, 3);
  });

  it('marca fuera de limite en acero inoxidable', () => {
    const resultado = evaluar({ ...parametros, material: 'acero_inoxidable' });
    assert.equal(resultado.dentroDeLimite, false);
    assert.equal(resultado.limiteKjMm, 1.5);
  });
});

describe('calcular', () => {
  it('devuelve el resultado sin el detalle interno de rangos', () => {
    const resultado = calcular({ proceso: 'mig', material: 'aluminio', voltaje: 24, amperaje: 200, velocidadMmMin: 300 });
    assert.deepEqual(resultado, {
      proceso: 'mig',
      material: 'aluminio',
      eficiencia: 0.8,
      calorKjMm: 0.768,
      clasificacion: 'bajo',
      limiteKjMm: 2,
      dentroDeLimite: true,
    });
  });

  it('lanza ValidationError cuando el voltaje no corresponde al proceso', () => {
    assert.throws(
      () => calcular({ proceso: 'tig', material: 'aluminio', voltaje: 40, amperaje: 100, velocidadMmMin: 100 }),
      (error) => {
        assert.ok(error instanceof ValidationError);
        assert.equal(error.statusCode, 400);
        assert.equal(error.codigo, 'RANGO_DE_PROCESO');
        assert.equal(error.detalles[0].campo, 'voltaje');
        return true;
      },
    );
  });
});
