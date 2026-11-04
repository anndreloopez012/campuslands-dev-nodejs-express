import { sessions } from '../data/users.data.js';

export const requireSession = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!sessions.has(token)) return res.status(401).json({ ok: false, message: "Sesión no válida. Inicia sesión primero" });
  req.userId = sessions.get(token);
  next();
};
