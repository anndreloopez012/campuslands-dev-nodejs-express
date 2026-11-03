import { corsConfig } from "../config/cors.config.js";
import { ForbiddenError } from "../utils/customErrors.js";

export const controlledCorsMiddleware = (req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (!requestOrigin) {
    return next();
  }

  if (!corsConfig.allowedOrigins.includes(requestOrigin)) {
    return next(
      new ForbiddenError(
        `El origen '${requestOrigin}' no está autorizado por la política CORS de la galería digital.`
      )
    );
  }

  res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", corsConfig.allowedMethods);
  res.setHeader("Access-Control-Allow-Headers", corsConfig.allowedHeaders);
  res.setHeader("Access-Control-Max-Age", String(corsConfig.maxAgeSeconds));

  if (corsConfig.allowCredentials) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
};
