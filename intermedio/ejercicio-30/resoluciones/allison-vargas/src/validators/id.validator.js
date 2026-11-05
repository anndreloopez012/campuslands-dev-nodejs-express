import { ValidationError } from '../utils/errors.js';

export function validarId(valor) {
  if (!/^[1-9]\d{0,9}$/.test(String(valor))) {
    throw new ValidationError('El id debe ser un entero positivo', undefined, 'ID_INVALIDO');
  }
  return Number(valor);
}
