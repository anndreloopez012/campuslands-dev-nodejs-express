import { leerToken } from '../services/auth.service.js';

export function autenticar(req, res, next) {
  try {
    const { claims, usuario } = leerToken(req.get('Authorization'));
    req.claims = claims;
    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
}
