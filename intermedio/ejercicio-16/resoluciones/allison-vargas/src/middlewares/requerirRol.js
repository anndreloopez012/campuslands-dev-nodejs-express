import { PermisoError } from '../utils/errors.js';

export const requerirRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return next(new PermisoError(`Esta ruta es solo para: ${roles.join(', ')}`));
  }
  return next();
};
