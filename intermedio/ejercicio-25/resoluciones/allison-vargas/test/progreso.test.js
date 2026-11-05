import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aplicarExperiencia, estadisticas } from '../src/utils/progreso.js';

describe('progreso de personajes', () => {
  it('acumula experiencia sin subir de nivel', () => {
    assert.deepEqual(aplicarExperiencia({ nivel: 3, experiencia: 0 }, 100), { nivel: 3, experiencia: 100, nivelesGanados: 0 });
  });

  it('sube varios niveles de una vez', () => {
    assert.deepEqual(aplicarExperiencia({ nivel: 1, experiencia: 0 }, 350), { nivel: 3, experiencia: 50, nivelesGanados: 2 });
  });

  it('se detiene en el nivel maximo', () => {
    assert.deepEqual(aplicarExperiencia({ nivel: 49, experiencia: 0 }, 100000), { nivel: 50, experiencia: 0, nivelesGanados: 1 });
  });

  it('calcula vida y mana segun clase y nivel', () => {
    assert.deepEqual(estadisticas('guerrero', 1), { vida: 100, mana: 10 });
    assert.deepEqual(estadisticas('mago', 11), { vida: 110, mana: 180 });
  });
});
