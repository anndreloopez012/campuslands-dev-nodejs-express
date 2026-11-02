import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: "Token requerido (Authorization: Bearer <token>)" });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch (err) {
    res.status(401).json({ ok: false, message: err.message });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ ok: false, message: "No tienes permisos para esta acción" });
  }
  next();
};
