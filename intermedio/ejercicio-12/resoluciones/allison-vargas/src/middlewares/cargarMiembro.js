import { obtener } from '../services/reparto.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarMiembro(req, res, next, valor) {
  try {
    req.miembro = obtener(req.pelicula.id, validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
