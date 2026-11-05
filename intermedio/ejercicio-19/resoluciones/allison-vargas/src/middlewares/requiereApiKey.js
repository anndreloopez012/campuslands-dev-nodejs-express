import { timingSafeEqual } from 'node:crypto';
import { NoAutenticadoError, PermisoError } from '../utils/errors.js';
import { config } from '../config/index.js';

const iguales = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function requiereApiKey(req, res, next) {
  const recibida = req.get('x-api-key');
  if (!recibida) return next(new NoAutenticadoError('Falta el header x-api-key', 'API_KEY_FALTANTE'));
  if (!iguales(recibida, config.apiKey)) return next(new PermisoError('La API key no es valida', 'API_KEY_INVALIDA'));
  return next();
}
