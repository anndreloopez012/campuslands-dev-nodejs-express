import { ForbiddenError, UnauthorizedError } from "../utils/customErrors.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new UnauthorizedError("Usuario no autenticado antes de evaluar roles de seguridad."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Acceso denegado. Rol '${req.user.role}' no autorizado. Se requiere uno de: [${allowedRoles.join(", ")}].`
        )
      );
    }

    next();
  };
};