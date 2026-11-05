import { RESOLUCIONES } from '../constants/escenas.js';

export const esquemaEscena = {
  titulo: { tipo: 'texto', min: 3, max: 80, requerido: true },
  autor: { tipo: 'texto', min: 2, max: 60, requerido: true },
  fps: { tipo: 'entero', min: 12, max: 120, requerido: true },
  duracionSeg: { tipo: 'entero', min: 1, max: 600, requerido: true },
  resolucion: { tipo: 'enum', valores: RESOLUCIONES, requerido: true },
};
