import { getUserByToken } from "../services/auth.service.js";

function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ ok: false, message: "Token requerido en el header Authorization con formato Bearer TOKEN" });

  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ ok: false, message: "Token invalido o sesion cerrada" });

  req.user = user;
  req.token = token;
  next();
}

export { authenticate };
