const { UnauthorizedError, ForbiddenError } = require('../errors/app.error');
const travelService = require('../services/travel.service');
const { puede } = require('../auth/permisos');

/** Carga la sesion del Bearer token o corta con 401. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  const sesion = travelService.sesionPorToken(token);

  if (!sesion) {
    return next(new UnauthorizedError('Token invalido o inexistente: inicia sesion primero'));
  }

  req.sesion = sesion;
  return next();
}

/**
 * Factory de permisos: la ruta declara la ACCION, no el rol.
 * requirePermiso('reservas:ver-todas') tolera agente y admin, sin tocar el codigo.
 */
function requirePermiso(accion) {
  return (req, res, next) => {
    if (!puede(req.sesion.rol, accion)) {
      return next(new ForbiddenError(`Tu rol "${req.sesion.rol}" no tiene el permiso "${accion}"`));
    }
    return next();
  };
}

module.exports = { requireAuth, requirePermiso };
