import { FACTOR_K } from '../constants/shooter.js';

export const promedio = (valores) => valores.reduce((suma, valor) => suma + valor, 0) / valores.length;

export const probabilidadDeGanar = (eloPropio, eloRival) => 1 / (1 + 10 ** ((eloRival - eloPropio) / 400));

export const puntosEnJuego = (eloGanador, eloPerdedor) =>
  Math.round(FACTOR_K * (1 - probabilidadDeGanar(eloGanador, eloPerdedor)));
