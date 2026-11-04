import { ejecutarConContexto } from '../utils/context.js';

export const contextoRequest = (req, res, next) => {
  ejecutarConContexto(req.id, next);
};
