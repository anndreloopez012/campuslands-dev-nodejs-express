import { crear } from '../errores/index.js';

export const metodoNoPermitido = (permitidos) => (req, res, next) => {
  res.set('Allow', permitidos.join(', '));
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next(crear('METODO_NO_PERMITIDO', { metodo: req.method }));
};
