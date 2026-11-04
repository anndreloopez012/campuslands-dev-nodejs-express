import { obtener } from '../services/resenas.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarResena(req, res, next, valor) {
  try {
    req.resena = obtener(req.pelicula.id, validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
