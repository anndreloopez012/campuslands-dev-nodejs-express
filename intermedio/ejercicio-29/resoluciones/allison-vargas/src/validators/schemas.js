import { GOLES_MAX, MODALIDADES } from '../constants/futbol.js';

export const esquemaEquipo = {
  nombre: { tipo: 'texto', min: 3, max: 30, requerido: true },
  modalidad: { tipo: 'enum', valores: MODALIDADES, requerido: true },
};

export const esquemaPartido = {
  localId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  visitanteId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  golesLocal: { tipo: 'entero', min: 0, max: GOLES_MAX, requerido: true },
  golesVisitante: { tipo: 'entero', min: 0, max: GOLES_MAX, requerido: true },
};
