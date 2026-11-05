import { AppError } from '../utils/errors.js';

export const metodoNoPermitido = (permitidos) => (req, res, next) => {
  res.set('Allow', permitidos.join(', '));
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next(new AppError(`El metodo ${req.method} no esta permitido en esta ruta`, 405, 'METODO_NO_PERMITIDO'));
};
