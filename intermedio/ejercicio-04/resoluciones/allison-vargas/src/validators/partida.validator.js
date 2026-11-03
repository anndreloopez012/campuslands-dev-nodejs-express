import { AppError } from '../utils/AppError.js';

const MAX_POSICION = 100;
const MAX_ELIMINACIONES = 50;

export function validarPartida(body) {
  const { jugadorId, posicion, eliminaciones } = body ?? {};
  const errores = [];

  if (!Number.isInteger(jugadorId) || jugadorId <= 0) {
    errores.push('jugadorId debe ser un entero positivo');
  }
  if (!Number.isInteger(posicion) || posicion < 1 || posicion > MAX_POSICION) {
    errores.push(`posicion debe ser un entero entre 1 y ${MAX_POSICION}`);
  }
  if (!Number.isInteger(eliminaciones) || eliminaciones < 0 || eliminaciones > MAX_ELIMINACIONES) {
    errores.push(`eliminaciones debe ser un entero entre 0 y ${MAX_ELIMINACIONES}`);
  }

  if (errores.length) throw new AppError(errores.join('. '), 400);
  return { jugadorId, posicion, eliminaciones };
}
