import { AppError } from "../errors.js";

const unauthorized = (res, code, message, challenge) => {
  res.set("WWW-Authenticate", challenge);
  return new AppError(401, code, message);
};

const createAuthenticate = (auth) => (req, res, next) => {
  const [scheme, token] = (req.get("authorization") ?? "").split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return next(unauthorized(res, "MISSING_TOKEN", "Falta el header Authorization: Bearer con el token", "Bearer"));

  const user = auth.verify(token);
  if (!user) return next(unauthorized(res, "INVALID_TOKEN", "Token invalido o sesion cerrada", 'Bearer error="invalid_token"'));

  req.user = user;
  req.token = token;
  next();
};

export { createAuthenticate };
