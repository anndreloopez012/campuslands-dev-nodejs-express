import { crearHttp } from '../http/errores-http.js';

const JSON_TYPE = /^application\/json\s*(;|$)/i;

export const exigirJson = (req, res, next) => {
  if (JSON_TYPE.test(req.headers['content-type'] || '')) return next();
  return next(crearHttp('TIPO_NO_SOPORTADO', 'El Content-Type debe ser application/json'));
};
