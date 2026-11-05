import { CUPOS_MAX, CUPOS_MIN, MAPAS, REGIONES } from '../constants/juego.js';

export const esquemaJugador = {
  nick: {
    tipo: 'texto',
    min: 3,
    max: 16,
    requerido: true,
    patron: /^[A-Za-z0-9_]+$/,
    mensajePatron: 'solo admite letras, numeros y guion bajo',
  },
  region: { tipo: 'enum', valores: REGIONES, requerido: true },
};

export const esquemaPartida = {
  mapa: { tipo: 'enum', valores: MAPAS, requerido: true },
  cupos: { tipo: 'entero', min: CUPOS_MIN, max: CUPOS_MAX, requerido: true },
};

export const esquemaUnirse = {
  jugadorId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
};

export const esquemaEliminacion = {
  eliminadoId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  eliminadorId: { tipo: 'entero', min: 1, max: 1000000, requerido: false },
};
