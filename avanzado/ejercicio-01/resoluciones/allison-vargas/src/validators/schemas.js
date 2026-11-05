import { CLASES, NIVEL_MAX } from '../constants/rpg.js';

const nombre = {
  tipo: 'texto',
  min: 3,
  max: 20,
  patron: /^[A-Za-z][A-Za-z ]*$/,
  mensajePatron: 'solo admite letras y espacios',
};

export const esquemaPersonajeV1 = {
  nombre: { ...nombre, requerido: true },
  clase: { tipo: 'enum', valores: CLASES, requerido: true },
};

export const esquemaPersonajeV2 = {
  nombre: { ...nombre, requerido: true },
  clase: { tipo: 'enum', valores: CLASES, requerido: true },
  nivel: { tipo: 'entero', min: 1, max: NIVEL_MAX, requerido: false, porDefecto: 1 },
};

export const esquemaEdicionV2 = {
  nombre: { ...nombre },
  nivel: { tipo: 'entero', min: 1, max: NIVEL_MAX },
};
