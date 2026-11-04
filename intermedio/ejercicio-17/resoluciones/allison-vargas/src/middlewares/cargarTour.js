import { obtenerVisible } from '../services/tours.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarTour(req, res, next) {
  try {
    req.tour = obtenerVisible(req.usuario, validarId(req.params.id));
    next();
  } catch (error) {
    next(error);
  }
}
