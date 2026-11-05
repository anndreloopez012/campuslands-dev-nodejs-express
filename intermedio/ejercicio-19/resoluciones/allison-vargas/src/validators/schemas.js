import { ESTADOS } from '../constants/citas.js';

export const esquemaCita = {
  cliente: { tipo: 'texto', min: 2, max: 60, requerido: true },
  email: { tipo: 'email', requerido: true },
  tatuadorId: { tipo: 'entero', min: 1, max: 1000000000, requerido: true },
  fecha: { tipo: 'fecha', requerido: true },
  hora: { tipo: 'hora', requerido: true },
  zona: { tipo: 'texto', min: 3, max: 40, requerido: true },
  precioEstimado: { tipo: 'entero', min: 1, max: 20000, requerido: true },
};

export const esquemaEstadoCita = {
  estado: { tipo: 'enum', valores: ESTADOS.filter((estado) => estado !== 'pendiente'), requerido: true },
};
