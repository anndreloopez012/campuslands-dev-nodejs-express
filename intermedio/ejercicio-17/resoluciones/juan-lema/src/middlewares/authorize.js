import { hasPermission } from "../services/auth.service.js";

const authorize = (...required) => (req, res, next) => {
  const missing = required.find((permission) => !hasPermission(req.user.role, permission));
  if (missing) return res.status(403).json({ ok: false, message: `Permiso requerido: ${missing}`, role: req.user.role });

  next();
};

export { authorize };
