import { crearHttp } from '../http/errores-http.js';

export const metodoNoPermitido = (permitidos) => (req, res, next) => {
  res.set('Allow', permitidos.join(', '));
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next(crearHttp('METODO_NO_PERMITIDO', `El metodo ${req.method} no esta permitido en esta ruta`));
};
