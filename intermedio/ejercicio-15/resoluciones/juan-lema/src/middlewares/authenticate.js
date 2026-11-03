import { verifyToken } from "../services/auth.service.js";

function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ ok: false, message: "Token requerido en el header Authorization con formato Bearer TOKEN" });

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ ok: false, message: error.name === "TokenExpiredError" ? "Token expirado" : "Token invalido" });
  }
}

export { authenticate };
