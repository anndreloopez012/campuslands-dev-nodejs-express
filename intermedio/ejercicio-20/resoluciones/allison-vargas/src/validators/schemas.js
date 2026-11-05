import { HERRAMIENTAS } from '../constants/obras.js';

export const esquemaObra = {
  titulo: { tipo: 'texto', min: 3, max: 80, requerido: true },
  artista: { tipo: 'texto', min: 2, max: 60, requerido: true },
  herramienta: { tipo: 'enum', valores: HERRAMIENTAS, requerido: true },
  ancho: { tipo: 'entero', min: 64, max: 8192, requerido: true },
  alto: { tipo: 'entero', min: 64, max: 8192, requerido: true },
  publica: { tipo: 'booleano', requerido: false },
};
