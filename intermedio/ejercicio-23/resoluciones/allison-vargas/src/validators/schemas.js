import { NOMBRES_MATERIALES, NOMBRES_PROCESOS } from '../constants/soldadura.js';

const parametros = {
  proceso: { tipo: 'enum', valores: NOMBRES_PROCESOS, requerido: true },
  material: { tipo: 'enum', valores: NOMBRES_MATERIALES, requerido: true },
  voltaje: { tipo: 'entero', min: 1, max: 100, requerido: true },
  amperaje: { tipo: 'entero', min: 1, max: 1500, requerido: true },
  velocidadMmMin: { tipo: 'entero', min: 50, max: 2000, requerido: true },
};

export const esquemaCalculo = { ...parametros };

export const esquemaProcedimiento = {
  ...parametros,
  espesorMm: { tipo: 'entero', min: 1, max: 100, requerido: true },
  soldador: { tipo: 'texto', min: 2, max: 60, requerido: true },
};
