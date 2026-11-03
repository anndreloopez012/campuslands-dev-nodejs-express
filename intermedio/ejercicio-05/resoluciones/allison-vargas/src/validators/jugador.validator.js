import { AppError } from '../utils/AppError.js';

export const POSICIONES = {
  futbol: ['portero', 'defensa', 'mediocampista', 'delantero'],
  'futbol sala': ['portero', 'cierre', 'ala', 'pivot'],
};

export const LIMITE_PLANTILLA = { futbol: 25, 'futbol sala': 14 };

export function validarJugador(body) {
  const errores = [];
  const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
  const { posicion, dorsal, equipoId } = body ?? {};

  if (nombre.length < 3 || nombre.length > 40) errores.push('nombre debe tener entre 3 y 40 caracteres');
  if (typeof posicion !== 'string' || !posicion) errores.push('posicion es obligatoria');
  if (!Number.isInteger(dorsal) || dorsal < 1 || dorsal > 99) errores.push('dorsal debe ser un entero entre 1 y 99');
  if (!Number.isInteger(equipoId) || equipoId <= 0) errores.push('equipoId debe ser un entero positivo');

  if (errores.length) throw new AppError(errores.join('. '), 400);
  return { nombre, posicion, dorsal, equipoId };
}

export function validarFiltroEquipo(valor) {
  if (valor === undefined) return undefined;
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('equipoId debe ser un entero positivo', 400);
  return id;
}
