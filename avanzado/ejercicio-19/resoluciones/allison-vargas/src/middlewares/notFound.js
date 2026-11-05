import { crear } from '../errores/index.js';

export const notFound = (req, res, next) => {
  next(crear('RUTA_NO_ENCONTRADA', { metodo: req.method, ruta: req.originalUrl }));
};
