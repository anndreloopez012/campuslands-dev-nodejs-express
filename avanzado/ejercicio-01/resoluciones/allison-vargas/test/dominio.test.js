import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcularAtributos } from '../src/domain/atributos.js';
import { estadoDeVersion } from '../src/domain/ciclo.js';
import { VERSIONES } from '../src/constants/versiones.js';

describe('atributos por clase y nivel', () => {
  it('en nivel 1 son los valores base', () => {
    assert.deepEqual(calcularAtributos('guerrero', 1), { vida: 120, mana: 20, fuerza: 18 });
    assert.deepEqual(calcularAtributos('mago', 1), { vida: 70, mana: 130, fuerza: 6 });
    assert.deepEqual(calcularAtributos('arquero', 1), { vida: 90, mana: 50, fuerza: 12 });
  });

  it('crecen un 10% de la base por cada nivel', () => {
    assert.deepEqual(calcularAtributos('guerrero', 11), { vida: 240, mana: 40, fuerza: 36 });
    assert.deepEqual(calcularAtributos('mago', 50), { vida: 413, mana: 767, fuerza: 35 });
  });
});

describe('ciclo de vida de una version', () => {
  const [v1, v2] = VERSIONES;
  const en = (texto) => new Date(texto);

  it('v1 es estable antes de su fecha de deprecacion', () => {
    assert.equal(estadoDeVersion(v1, en('2026-06-30T23:59:59.000Z')), 'estable');
  });

  it('v1 queda deprecada desde la fecha indicada hasta el retiro', () => {
    assert.equal(estadoDeVersion(v1, en('2026-07-01T00:00:00.000Z')), 'deprecada');
    assert.equal(estadoDeVersion(v1, en('2027-03-31T23:59:59.000Z')), 'deprecada');
  });

  it('v1 queda retirada despues de la fecha de retiro', () => {
    assert.equal(estadoDeVersion(v1, en('2027-04-01T00:00:00.000Z')), 'retirada');
  });

  it('v2 siempre es estable', () => {
    assert.equal(estadoDeVersion(v2, en('2030-01-01T00:00:00.000Z')), 'estable');
  });
});
