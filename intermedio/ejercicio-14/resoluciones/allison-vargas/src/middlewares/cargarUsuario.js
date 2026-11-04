import { obtener } from '../services/usuarios.service.js';
import { validarId } from '../validators/id.validator.js';

export function cargarUsuario(req, res, next, valor) {
  try {
    req.usuarioObjetivo = obtener(validarId(valor));
    next();
  } catch (error) {
    next(error);
  }
}
