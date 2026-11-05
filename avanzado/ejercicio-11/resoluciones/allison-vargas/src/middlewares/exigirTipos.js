import { crear } from '../errores/index.js';

export const exigirTipos = (permitidos) => (req, res, next) => {
  const recibido = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (permitidos.includes(recibido)) return next();
  return next(crear('FORMATO_NO_SOPORTADO', { esperado: permitidos.join(' o ') }));
};
