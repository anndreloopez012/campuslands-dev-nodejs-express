import { obtener } from '../services/tripulantes.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarTripulante(req, res, next, valor) {
  try {
    req.tripulante = obtener(validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
