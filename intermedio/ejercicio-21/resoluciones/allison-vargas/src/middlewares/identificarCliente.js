import { ValidationError } from '../utils/errors.js';

const FORMATO = /^[a-z0-9_-]{3,40}$/i;

export function identificarCliente(req, res, next) {
  const enviado = req.get('x-cliente');
  if (enviado === undefined) {
    req.cliente = { id: `ip:${req.ip}`, origen: 'ip' };
    return next();
  }
  if (!FORMATO.test(enviado)) {
    return next(new ValidationError('Cabecera invalida', [{ campo: 'x-cliente', mensaje: 'debe tener de 3 a 40 caracteres: letras, numeros, guion o guion bajo' }], 'CLIENTE_INVALIDO'));
  }
  req.cliente = { id: `cliente:${enviado.toLowerCase()}`, origen: 'cabecera' };
  return next();
}
