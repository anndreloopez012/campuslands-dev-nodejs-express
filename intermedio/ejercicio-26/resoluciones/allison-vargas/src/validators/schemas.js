import { REGIONES } from '../constants/shooter.js';

export const esquemaJugador = {
  nick: { tipo: 'texto', min: 3, max: 16, requerido: true },
  region: { tipo: 'enum', valores: REGIONES, requerido: true },
};
