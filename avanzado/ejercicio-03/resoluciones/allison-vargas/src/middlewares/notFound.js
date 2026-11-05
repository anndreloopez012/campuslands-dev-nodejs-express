import { NotFoundError } from '../utils/errors.js';

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 'RUTA_NO_ENCONTRADA'));
};
