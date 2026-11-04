import { obtener } from '../services/libros.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarLibro(req, res, next) {
  try {
    req.libro = obtener(validarId(req.params.id));
    next();
  } catch (error) {
    next(error);
  }
}
