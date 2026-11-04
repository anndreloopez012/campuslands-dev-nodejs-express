import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

const API_KEY = process.env.API_KEY || 'clave-concesionario';

export const apiKey = (req, res, next) => {
  const clave = req.get('x-api-key');
  if (!clave) return next(new UnauthorizedError('Falta el header x-api-key'));
  if (clave !== API_KEY) return next(new ForbiddenError('La clave de API no es valida'));
  next();
};
