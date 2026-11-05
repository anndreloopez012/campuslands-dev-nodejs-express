import { crearHttp } from '../http/errores-http.js';

export const notFound = (req, res, next) => {
  next(crearHttp('RUTA_NO_ENCONTRADA', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
