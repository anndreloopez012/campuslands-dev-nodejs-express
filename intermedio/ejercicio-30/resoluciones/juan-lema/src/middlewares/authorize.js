import { AppError } from "../errors.js";
import { hasPermission } from "../services/auth.service.js";

const authorize = (...required) => (req, res, next) => {
  const missing = required.find((permission) => !hasPermission(req.user.role, permission));
  if (missing) return next(new AppError(403, "FORBIDDEN", `Permiso requerido: ${missing}`));

  next();
};

export { authorize };
