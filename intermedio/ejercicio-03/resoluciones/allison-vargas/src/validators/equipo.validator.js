import { AppError } from '../utils/AppError.js';

export const REGIONES = ['LAN', 'LAS', 'NA', 'EU', 'KR'];

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

export function validarEquipo(body) {
  const errores = [];
  const nombre = texto(body?.nombre);
  const region = body?.region;

  if (nombre.length < 3 || nombre.length > 30) errores.push('nombre debe tener entre 3 y 30 caracteres');
  if (!REGIONES.includes(region)) errores.push(`region debe ser una de: ${REGIONES.join(', ')}`);

  if (errores.length) throw new AppError(errores.join('. '), 400);
  return { nombre, region };
}

export function validarJugador(body) {
  const nick = texto(body?.nick);
  if (nick.length < 3 || nick.length > 16) {
    throw new AppError('nick debe tener entre 3 y 16 caracteres', 400);
  }
  return { nick };
}
