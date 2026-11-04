import { ValidationError } from '../utils/errors.js';

export function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El id debe ser un entero positivo', undefined, 'ID_INVALIDO');
  }
  return id;
}
