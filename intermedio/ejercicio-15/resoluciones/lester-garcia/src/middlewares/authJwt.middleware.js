import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/customErrors.js";

export const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return next(new UnauthorizedError("Encabezado de autorización ausente. Formato: 'Bearer <token>'."));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new UnauthorizedError("Esquema de autenticación inválido. Utilice el formato Bearer."));
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || "fallback_default_secret_jwt_2026";

  try {
    const decoded = jwt.verify(token, secret);

    // Inyectar el payload en req.user
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("El token JWT ha expirado. Por favor inicia sesión de nuevo."));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Token JWT inválido o firma digital corrupta."));
    }
    return next(new UnauthorizedError("Fallo al validar credenciales JWT."));
  }
};