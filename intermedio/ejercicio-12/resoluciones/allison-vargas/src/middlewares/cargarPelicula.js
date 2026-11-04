import { obtener } from '../services/peliculas.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarPelicula(req, res, next, valor) {
  try {
    req.pelicula = obtener(validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
