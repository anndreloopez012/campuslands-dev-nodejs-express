import { PermisoError } from '../utils/errors.js';
import { tieneAlguno } from '../constants/permisos.js';

export const requierePermiso = (...permisos) => (req, res, next) => {
  if (tieneAlguno(req.usuario, permisos)) return next();
  const detalle = permisos.length === 1 ? permisos[0] : `alguno de: ${permisos.join(', ')}`;
  return next(new PermisoError(
    `Tu rol (${req.usuario.rol}) no tiene el permiso requerido`,
    'PERMISOS_INSUFICIENTES',
    [{ campo: 'permiso', mensaje: detalle }],
  ));
};
