const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parsearFormula, masaMolar, porcentajeElemento } = require('../services/chemistry.service');

describe('parsearFormula', () => {
  it('parsea formulas simples con subindices', () => {
    assert.deepEqual(parsearFormula('H2O'), { H: 2, O: 1 });
    assert.deepEqual(parsearFormula('NaCl'), { Na: 1, Cl: 1 });
  });

  it('acumula elementos repetidos en la misma formula', () => {
    assert.deepEqual(parsearFormula('CH3CH3'), { C: 2, H: 6 });
  });

  it('lanza TypeError para formulas invalidas', () => {
    assert.throws(() => parsearFormula('h2o'), TypeError);   // minuscula inicial
    assert.throws(() => parsearFormula('H2!'), TypeError);   // caracter ilegal
    assert.throws(() => parsearFormula(''), TypeError);      // vacia
    assert.throws(() => parsearFormula('H0'), TypeError);    // subindice cero
  });
});

describe('masaMolar', () => {
  it('calcula la masa molar del agua (H2O = 18.015)', () => {
    assert.equal(masaMolar({ H: 2, O: 1 }), 18.015);
  });

  it('calcula la masa del cloruro de sodio NaCl (58.443)', () => {
    assert.equal(masaMolar({ Na: 1, Cl: 1 }), 58.443);
  });

  it('lanza TypeError para elementos desconocidos', () => {
    assert.throws(() => masaMolar({ Xx: 1 }), TypeError);
  });
});

describe('porcentajeElemento', () => {
  it('calcula el porcentaje de O en NaClO3 (~45.09%)', () => {
    const pct = porcentajeElemento('NaClO3', 'O');
    assert.ok(pct > 45 && pct < 46, `porcentaje inesperado: ${pct}`);
  });

  it('el 100% del elemento unico coincide con su masa total', () => {
    assert.equal(porcentajeElemento('N2', 'N'), 100);
  });

  it('falla cuando el elemento no esta en la formula', () => {
    assert.throws(() => porcentajeElemento('H2O', 'Fe'), TypeError);
  });
});
