import { AppError } from '../utils/AppError.js';

export const DEPORTES = ['futbol', 'futbol sala'];

export function validarEquipo(body) {
  const errores = [];
  const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
  const deporte = body?.deporte;

  if (nombre.length < 3 || nombre.length > 30) errores.push('nombre debe tener entre 3 y 30 caracteres');
  if (!DEPORTES.includes(deporte)) errores.push(`deporte debe ser uno de: ${DEPORTES.join(', ')}`);

  if (errores.length) throw new AppError(errores.join('. '), 400);
  return { nombre, deporte };
}
