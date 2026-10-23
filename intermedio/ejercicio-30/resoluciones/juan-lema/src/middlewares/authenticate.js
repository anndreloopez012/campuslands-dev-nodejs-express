import { AppError } from "../errors.js";

const createAuthenticate = (auth) => (req, res, next) => {
  const [scheme, token] = (req.get("authorization") ?? "").split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    res.set("WWW-Authenticate", "Bearer");
    return next(new AppError(401, "MISSING_TOKEN", "Falta el header Authorization con formato Bearer TOKEN"));
  }

  try {
    req.user = auth.verify(token);
    next();
  } catch (error) {
    res.set("WWW-Authenticate", 'Bearer error="invalid_token"');
    next(error);
  }
};

export { createAuthenticate };
