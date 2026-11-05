import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crearFormulasService } from '../../src/services/formulas.service.js';
import { AVOGADRO } from '../../src/constants/quimica.js';
import { ValidationError } from '../../src/utils/errors.js';

const tabla = {
  H: { nombre: 'Hidrogeno', masa: 1 },
  C: { nombre: 'Carbono', masa: 12 },
  N: { nombre: 'Nitrogeno', masa: 14 },
  O: { nombre: 'Oxigeno', masa: 16 },
  Na: { nombre: 'Sodio', masa: 23 },
  Al: { nombre: 'Aluminio', masa: 27 },
  S: { nombre: 'Azufre', masa: 32 },
  Cl: { nombre: 'Cloro', masa: 35.5 },
  K: { nombre: 'Potasio', masa: 39 },
  Ca: { nombre: 'Calcio', masa: 40 },
  Fe: { nombre: 'Hierro', masa: 56 },
  Cu: { nombre: 'Cobre', masa: 64 },
};

const formulas = crearFormulasService({ elementos: tabla });

const capturar = (accion) => {
  try {
    accion();
  } catch (error) {
    return error;
  }
  return assert.fail('se esperaba un error');
};

describe('parsear', () => {
  const validas = [
    ['H2O', { H: 2, O: 1 }],
    ['NaCl', { Na: 1, Cl: 1 }],
    ['CO', { C: 1, O: 1 }],
    ['Ca(OH)2', { Ca: 1, O: 2, H: 2 }],
    ['Al2(SO4)3', { Al: 2, S: 3, O: 12 }],
    ['K4[Fe(CN)6]', { K: 4, Fe: 1, C: 6, N: 6 }],
    ['CH3COOH', { C: 2, H: 4, O: 2 }],
    ['CuSO4.5H2O', { Cu: 1, S: 1, O: 9, H: 10 }],
    ['  NaCl  ', { Na: 1, Cl: 1 }],
  ];

  for (const [entrada, esperado] of validas) {
    it(`entiende "${entrada.trim()}"`, () => {
      assert.deepEqual(formulas.parsear(entrada), esperado);
    });
  }

  const invalidas = [
    ['', 'FORMULA_INVALIDA', 0],
    ['   ', 'FORMULA_INVALIDA', 0],
    ['h2o', 'FORMULA_INVALIDA', 0],
    ['H2O)', 'FORMULA_INVALIDA', 3],
    ['(H2O', 'FORMULA_INVALIDA', 0],
    ['Ca(OH2', 'FORMULA_INVALIDA', 2],
    ['[H2O)', 'FORMULA_INVALIDA', 4],
    ['H0', 'FORMULA_INVALIDA', 1],
    ['H1000', 'FORMULA_INVALIDA', 1],
    ['2H2O', 'FORMULA_INVALIDA', 0],
    ['H2O?', 'FORMULA_INVALIDA', 3],
    ['()', 'FORMULA_INVALIDA', 0],
    ['Xx2', 'ELEMENTO_DESCONOCIDO', 0],
    ['Co', 'ELEMENTO_DESCONOCIDO', 0],
    ['NaCl.2Zz', 'ELEMENTO_DESCONOCIDO', 6],
  ];

  for (const [entrada, codigo, posicion] of invalidas) {
    it(`rechaza "${entrada}" con ${codigo} en la posicion ${posicion}`, () => {
      const error = capturar(() => formulas.parsear(entrada));
      assert.ok(error instanceof ValidationError);
      assert.equal(error.statusCode, 400);
      assert.equal(error.codigo, codigo);
      assert.equal(error.detalles[0].posicion, posicion);
    });
  }

  it('rechaza un valor que no es texto', () => {
    assert.equal(capturar(() => formulas.parsear(null)).codigo, 'FORMULA_INVALIDA');
    assert.equal(capturar(() => formulas.parsear(42)).codigo, 'FORMULA_INVALIDA');
  });

  it('rechaza formulas de mas de 80 caracteres', () => {
    assert.equal(capturar(() => formulas.parsear('H'.repeat(81))).codigo, 'FORMULA_INVALIDA');
  });
});

describe('masaMolar', () => {
  const casos = [
    ['H2O', 18],
    ['CO2', 44],
    ['NaCl', 58.5],
    ['Ca(OH)2', 74],
    ['C6H12O6', 180],
    ['CuSO4.5H2O', 250],
  ];

  for (const [formula, esperado] of casos) {
    it(`${formula} pesa ${esperado} g/mol`, () => {
      assert.equal(formulas.masaMolar(formula), esperado);
    });
  }

  it('usa la tabla que se le inyecta', () => {
    const otra = crearFormulasService({ elementos: { H: { nombre: 'H', masa: 2 }, O: { nombre: 'O', masa: 20 } } });
    assert.equal(otra.masaMolar('H2O'), 24);
  });

  it('propaga el error de una formula invalida', () => {
    assert.throws(() => formulas.masaMolar('Ca(OH'), { codigo: 'FORMULA_INVALIDA' });
  });
});

describe('analizar', () => {
  it('devuelve masa, atomos y composicion porcentual', () => {
    const resultado = formulas.analizar('H2O');
    assert.equal(resultado.masaMolar, 18);
    assert.equal(resultado.atomosTotales, 3);
    assert.deepEqual(resultado.composicion, [
      { simbolo: 'H', nombre: 'Hidrogeno', atomos: 2, masa: 2, porcentaje: 11.11 },
      { simbolo: 'O', nombre: 'Oxigeno', atomos: 1, masa: 16, porcentaje: 88.89 },
    ]);
  });

  it('los porcentajes suman cerca de 100', () => {
    const suma = formulas.analizar('Al2(SO4)3').composicion.reduce((total, fila) => total + fila.porcentaje, 0);
    assert.ok(Math.abs(suma - 100) < 0.05, `suma ${suma}`);
  });

  it('conserva la formula sin espacios sobrantes', () => {
    assert.equal(formulas.analizar('  NaCl ').formula, 'NaCl');
  });
});

describe('convertir', () => {
  it('pasa de gramos a moles y moleculas', () => {
    const resultado = formulas.convertir({ formula: 'H2O', gramos: 36 });
    assert.equal(resultado.moles, 2);
    assert.equal(resultado.gramos, 36);
    assert.ok(Math.abs(resultado.moleculas / (2 * AVOGADRO) - 1) < 1e-12);
  });

  it('pasa de moles a gramos', () => {
    const resultado = formulas.convertir({ formula: 'NaCl', moles: 3 });
    assert.equal(resultado.gramos, 175.5);
    assert.equal(resultado.masaMolar, 58.5);
  });

  it('exige gramos o moles, pero no ambos', () => {
    assert.throws(() => formulas.convertir({ formula: 'H2O' }), ValidationError);
    assert.throws(() => formulas.convertir({ formula: 'H2O', gramos: 1, moles: 1 }), ValidationError);
  });

  it('propaga el error de una formula invalida', () => {
    assert.throws(() => formulas.convertir({ formula: 'Zz', gramos: 1 }), { codigo: 'ELEMENTO_DESCONOCIDO' });
  });
});

describe('verificarEcuacion', () => {
  it('reconoce una ecuacion balanceada con flecha', () => {
    const resultado = formulas.verificarEcuacion('2H2 + O2 -> 2H2O');
    assert.equal(resultado.balanceada, true);
    assert.deepEqual(resultado.reactivos.atomos, { H: 4, O: 2 });
    assert.deepEqual(resultado.productos.atomos, { H: 4, O: 2 });
    assert.deepEqual(resultado.diferencias, []);
  });

  it('acepta el signo igual y coeficientes separados por espacio', () => {
    assert.equal(formulas.verificarEcuacion('2 H2 + O2 = 2 H2O').balanceada, true);
  });

  it('reconoce una combustion balanceada', () => {
    assert.equal(formulas.verificarEcuacion('CH4 + 2O2 -> CO2 + 2H2O').balanceada, true);
  });

  it('senala los elementos que no coinciden', () => {
    const resultado = formulas.verificarEcuacion('H2 + O2 -> H2O');
    assert.equal(resultado.balanceada, false);
    assert.deepEqual(resultado.diferencias, [{ elemento: 'O', reactivos: 2, productos: 1 }]);
  });

  it('cuenta como diferencia un elemento que solo aparece de un lado', () => {
    const resultado = formulas.verificarEcuacion('NaCl -> Na');
    assert.deepEqual(resultado.diferencias, [{ elemento: 'Cl', reactivos: 1, productos: 0 }]);
  });

  it('devuelve los terminos con su coeficiente', () => {
    const resultado = formulas.verificarEcuacion('2H2 + O2 -> 2H2O');
    assert.deepEqual(resultado.reactivos.terminos, [
      { formula: 'H2', coeficiente: 2 },
      { formula: 'O2', coeficiente: 1 },
    ]);
  });

  const invalidas = [
    ['H2 + O2', 'sin separador'],
    ['H2 -> O2 -> H2O', 'dos separadores'],
    ['H2 + -> H2O', 'termino vacio'],
    ['H2 + Qq -> H2Qq', 'elemento desconocido'],
  ];

  for (const [ecuacion, motivo] of invalidas) {
    it(`rechaza una ecuacion ${motivo}`, () => {
      assert.throws(() => formulas.verificarEcuacion(ecuacion), ValidationError);
    });
  }
});
