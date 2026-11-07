const { UnauthorizedError, ForbiddenError } = require('../errors/app.error');
const sessionService = require('../services/session.service');

/**
 * Middleware de rutas protegidas.
 * Anade req.sesion si el token es valido, o corta con 401.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Se requiere "Authorization: Bearer <token>"'));
  }

  try {
    req.sesion = sessionService.sesionPorToken(token);
    return next();
  } catch (error) {
    return next(error);
  }
}

/** Variante opcional: restringe la ruta a uno o varios roles. Siempre despues de requireAuth. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.sesion) {
      return next(new UnauthorizedError('Falta la sesion: monta requireAuth antes de requireRole'));
    }
    if (!roles.includes(req.sesion.rol)) {
      return next(new ForbiddenError(`Requiere uno de los roles: ${roles.join(', ')}`));
    }
    return next();
  };
}

/** Handler de logout: libera el token cuando el cliente decide cerrar sesion. */
function logoutHandler(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  try {
    sessionService.logout(token);
    return res.status(200).json({ ok: true, message: 'Sesion cerrada' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAuth, requireRole, logoutHandler };
