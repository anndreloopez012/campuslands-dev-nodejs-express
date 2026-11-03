import { verifySimulatedToken } from "../utils/tokenSimulator.js";
import { UnauthorizedError } from "../utils/customErrors.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return next(new UnauthorizedError("Encabezado de autorización ausente. Envíe 'Authorization: Bearer <token>'."));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next(new UnauthorizedError("Formato de token no reconocido. Utilice el esquema Bearer."));
  }

  const token = parts[1];
  const decodedUser = verifySimulatedToken(token);

  if (!decodedUser) {
    return next(new UnauthorizedError("Token de sesión inválido o expirado. Inicie sesión nuevamente."));
  }

  // Inyección de la identidad del usuario en el objeto req
  req.user = {
    id: decodedUser.id,
    name: decodedUser.name,
    email: decodedUser.email,
    role: decodedUser.role
  };

  next();
};