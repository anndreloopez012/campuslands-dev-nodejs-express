import { resolverSesion } from '../services/auth.service.js';

export function autenticar(req, res, next) {
  try {
    const { sesion, usuario } = resolverSesion(req.get('Authorization'));
    req.sesion = sesion;
    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}
