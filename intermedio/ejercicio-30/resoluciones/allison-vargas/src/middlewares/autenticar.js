import { NoAutenticadoError, PermisoError } from '../utils/errors.js';

const BEARER = /^Bearer (\S+)$/;

export const autenticar = (auth) => (req, res, next) => {
  const coincidencia = BEARER.exec(req.headers.authorization || '');
  if (!coincidencia) return next(new NoAutenticadoError('Falta el token: usa Authorization: Bearer <token>'));
  try {
    req.usuario = auth.autenticar(coincidencia[1]);
    return next();
  } catch (error) {
    return next(error);
  }
};

export const exigirRol = (...roles) => (req, res, next) => {
  if (roles.includes(req.usuario.rol)) return next();
  return next(new PermisoError(`Esta accion requiere el rol: ${roles.join(' o ')}`));
};
