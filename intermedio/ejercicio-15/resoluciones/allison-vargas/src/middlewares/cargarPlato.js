import { obtener } from '../services/menu.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarPlato(req, res, next) {
  try {
    req.plato = obtener(validarId(req.params.id));
    next();
  } catch (error) {
    next(error);
  }
}
