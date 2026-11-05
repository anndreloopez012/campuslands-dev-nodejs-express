import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar, convertir, parsearFormula } from '../src/quimica/formula.js';

const elementos = JSON.parse(readFileSync(new URL('../src/data/elementos.json', import.meta.url), 'utf-8'));
const simbolos = new Set(elementos.map((e) => e.simbolo));
const parsear = (f) => parsearFormula(f, simbolos);
const fallaCon = (formula, posicion, motivo) => assert.throws(() => parsear(formula), (e) => e.codigo === 'FORMULA_INVALIDA'
  && e.contexto.posicion === posicion && e.contexto.motivo.includes(motivo));

describe('parser de formulas', () => {
  it('cuenta atomos con subindices, parentesis anidados e hidratos', () => {
    assert.deepEqual(parsear('H2O'), { H: 2, O: 1 });
    assert.deepEqual(parsear('Ca(OH)2'), { Ca: 1, O: 2, H: 2 });
    assert.deepEqual(parsear('K4[Fe(CN)6]'), {
      K: 4, Fe: 1, C: 6, N: 6,
    });
    assert.deepEqual(parsear('CuSO4\u00B75H2O'), {
      Cu: 1, S: 1, O: 9, H: 10,
    });
    assert.deepEqual(parsear('CuSO4.5H2O'), parsear('CuSO4*5H2O'));
    assert.deepEqual(parsear('C12H22O11'), { C: 12, H: 22, O: 11 });
  });

  it('explica donde y por que falla', () => {
    fallaCon('H2Xy', 2, 'elemento desconocido "Xy"');
    fallaCon('Ca(OH', 2, 'falta cerrar "("');
    fallaCon('H0', 1, 'no puede ser 0');
    fallaCon('h2o', 0, 'caracter inesperado "h"');
    fallaCon('H2O)', 3, 'caracter inesperado ")"');
    fallaCon('()', 1, 'grupo vacio');
    fallaCon('', 0, 'de 1 a 100');
  });
});

describe('analisis y conversion', () => {
  it('calcula masa molar y porcentajes', () => {
    const agua = analizar('H2O', elementos);
    assert.equal(agua.masaMolar, 18.015);
    assert.equal(agua.atomosTotales, 3);
    assert.deepEqual(agua.composicion.map((c) => [c.simbolo, c.porcentaje]), [['H', 11.19], ['O', 88.81]]);
    assert.equal(analizar('H2SO4', elementos).masaMolar, 98.072);
    assert.equal(analizar('Ca(OH)2', elementos).masaMolar, 74.092);
    const total = analizar('CuSO4\u00B75H2O', elementos).composicion.reduce((t, c) => t + c.porcentaje, 0);
    assert.ok(Math.abs(total - 100) < 0.05);
  });

  it('convierte gramos a moles y moleculas', () => {
    assert.deepEqual(convertir('H2O', 36, elementos), {
      formula: 'H2O', gramos: 36, masaMolar: 18.015, moles: 1.99833, moleculas: 1.20343e24,
    });
  });
});
