import { identificar } from '../services/auth.service.js';
import { NoAutenticadoError } from '../utils/errors.js';

export function autenticar(req, res, next) {
  const cabecera = req.get('Authorization');
  if (!cabecera) return next(new NoAutenticadoError());
  try {
    req.usuario = identificar(cabecera);
    return next();
  } catch (error) {
    return next(error);
  }
}
