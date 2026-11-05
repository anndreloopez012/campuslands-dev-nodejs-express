import { crear } from '../errores/index.js';

export const exigirTipo = (esperado) => (req, res, next) => {
  const recibido = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (recibido === esperado) return next();
  return next(crear('FORMATO_NO_SOPORTADO', { esperado }));
};
