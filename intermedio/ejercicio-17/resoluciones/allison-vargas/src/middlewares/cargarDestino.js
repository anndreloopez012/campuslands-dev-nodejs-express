import { obtener } from '../services/destinos.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarDestino(req, res, next) {
  try {
    req.destino = obtener(validarId(req.params.id));
    next();
  } catch (error) {
    next(error);
  }
}
