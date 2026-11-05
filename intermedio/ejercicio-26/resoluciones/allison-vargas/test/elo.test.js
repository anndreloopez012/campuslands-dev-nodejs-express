import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { probabilidadDeGanar, promedio, puntosEnJuego } from '../src/utils/elo.js';

describe('calculo de elo', () => {
  it('promedia los puntos del equipo', () => {
    assert.equal(promedio([1500, 1620, 1380]), 1500);
  });

  it('da 50% de probabilidad a rivales iguales', () => {
    assert.equal(probabilidadDeGanar(1500, 1500), 0.5);
  });

  it('reparte 16 puntos entre rivales iguales', () => {
    assert.equal(puntosEnJuego(1500, 1500), 16);
  });

  it('el favorito gana menos puntos que el que da la sorpresa', () => {
    assert.equal(puntosEnJuego(1600, 1400), 8);
    assert.equal(puntosEnJuego(1400, 1600), 24);
  });

  it('nunca supera el factor K', () => {
    assert.ok(puntosEnJuego(0, 4000) <= 32);
  });
});
