import { obtener } from '../services/misiones.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarMision(req, res, next, valor) {
  try {
    req.mision = obtener(validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
