import { REGIONES } from '../../constants/dominio.js';

export const esquemaJugador = {
  alias: {
    tipo: 'texto',
    min: 3,
    max: 16,
    requerido: true,
    patron: /^[A-Za-z0-9_]+$/,
    mensajePatron: 'solo admite letras, numeros y guion bajo',
  },
  region: { tipo: 'enum', valores: REGIONES, requerido: true },
};
