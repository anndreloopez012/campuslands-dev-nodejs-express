import { AppError } from '../utils/errors.js';

export const metodoNoPermitido = (permitidos) => (req, res, next) => {
  res.set('Allow', permitidos.join(', '));
  next(new AppError(`El metodo ${req.method} no esta permitido en esta ruta`, 405, 'METODO_NO_PERMITIDO'));
};
