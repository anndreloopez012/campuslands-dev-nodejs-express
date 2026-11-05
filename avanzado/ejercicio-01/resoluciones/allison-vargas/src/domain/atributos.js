import { BASE_POR_CLASE, CRECIMIENTO_POR_NIVEL } from '../constants/rpg.js';

export function calcularAtributos(clase, nivel) {
  const base = BASE_POR_CLASE[clase];
  const factor = 1 + CRECIMIENTO_POR_NIVEL * (nivel - 1);
  return {
    vida: Math.round(base.vida * factor),
    mana: Math.round(base.mana * factor),
    fuerza: Math.round(base.fuerza * factor),
  };
}
