import { ID_MAX, MAPAS, PUNTAJE_MAX } from '../../constants/dominio.js';

export const esquemaPartida = {
  jugadorA: { tipo: 'entero', min: 1, max: ID_MAX, requerido: true },
  jugadorB: { tipo: 'entero', min: 1, max: ID_MAX, requerido: true },
  mapa: { tipo: 'enum', valores: MAPAS, requerido: true },
};

export const esquemaResultado = {
  puntajeA: { tipo: 'entero', min: 0, max: PUNTAJE_MAX, requerido: true },
  puntajeB: { tipo: 'entero', min: 0, max: PUNTAJE_MAX, requerido: true },
};
