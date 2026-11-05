import { CATEGORIAS } from '../constants/quimica.js';

export const esquemaFormula = {
  formula: { tipo: 'texto', min: 1, max: 80, requerido: true },
};

export const esquemaConversion = {
  formula: { tipo: 'texto', min: 1, max: 80, requerido: true },
  gramos: { tipo: 'numero', min: 0.000001, max: 1000000000, requerido: false },
  moles: { tipo: 'numero', min: 0.000001, max: 1000000000, requerido: false },
};

export const esquemaEcuacion = {
  ecuacion: { tipo: 'texto', min: 3, max: 200, requerido: true },
};

export const esquemaCompuesto = {
  nombre: { tipo: 'texto', min: 3, max: 60, requerido: true },
  formula: { tipo: 'texto', min: 1, max: 80, requerido: true },
  categoria: { tipo: 'enum', valores: CATEGORIAS, requerido: true },
};
