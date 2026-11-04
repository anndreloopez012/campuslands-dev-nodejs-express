import { PermisoError } from '../utils/errors.js';
import { tieneRol } from '../constants/roles.js';

export const requerirRol = (rolMinimo) => (req, res, next) => {
  if (!tieneRol(req.usuario.rol, rolMinimo)) {
    return next(new PermisoError(`Esta accion requiere el rol ${rolMinimo} o superior`));
  }
  return next();
};
