import { obtener } from '../services/productos.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarProducto(req, res, next) {
  try {
    req.producto = obtener(validarId(req.params.id));
    next();
  } catch (error) {
    next(error);
  }
}
