import { CLASES, NIVEL_MAX } from '../constants/rpg.js';

export const experienciaParaSubir = (nivel) => nivel * 100;

export function estadisticas(clase, nivel) {
  const base = CLASES[clase];
  return {
    vida: base.vida + (nivel - 1) * base.vidaPorNivel,
    mana: base.mana + (nivel - 1) * base.manaPorNivel,
  };
}

export function aplicarExperiencia({ nivel, experiencia }, ganada) {
  let actual = nivel;
  let acumulada = experiencia + ganada;
  while (actual < NIVEL_MAX && acumulada >= experienciaParaSubir(actual)) {
    acumulada -= experienciaParaSubir(actual);
    actual += 1;
  }
  if (actual === NIVEL_MAX) acumulada = 0;
  return { nivel: actual, experiencia: acumulada, nivelesGanados: actual - nivel };
}
