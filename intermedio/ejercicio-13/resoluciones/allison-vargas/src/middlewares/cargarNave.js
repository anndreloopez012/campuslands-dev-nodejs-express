import { obtener } from '../services/naves.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarNave(req, res, next, valor) {
  try {
    req.nave = obtener(validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
