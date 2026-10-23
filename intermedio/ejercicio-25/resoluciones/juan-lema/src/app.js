import express from "express";
import { AppError } from "./errors.js";
import { createAuthService } from "./services/auth.service.js";
import { createCharactersService, SEED_CHARACTERS } from "./services/characters.service.js";
import { createAuthController } from "./controllers/auth.controller.js";
import { createCharactersController } from "./controllers/characters.controller.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createCharactersRouter } from "./routes/characters.routes.js";
import { createAuthenticate } from "./middlewares/authenticate.js";
import { allowMethods } from "./middlewares/allow-methods.js";
import { errorHandler } from "./middlewares/error-handler.js";

function requireJson(req, res, next) {
  const hasContent = Number(req.get("content-length") ?? 0) > 0 || req.get("transfer-encoding") !== undefined;

  next(hasContent && !req.is("json") ? new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type debe ser application/json") : undefined);
}

function createApp({ auth = createAuthService(), characters = createCharactersService({ seed: SEED_CHARACTERS }) } = {}) {
  const app = express();
  const authenticate = createAuthenticate(auth);

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });
  app.route("/health").get((req, res) => res.json({ ok: true, message: "API de RPG activa" })).all(allowMethods("GET", "HEAD"));
  app.use(requireJson, express.json({ limit: "10kb" }));
  app.use("/auth", createAuthRouter({ controller: createAuthController({ auth }), authenticate }));
  app.use("/characters", createCharactersRouter({ controller: createCharactersController({ characters }), authenticate }));
  app.use((req, res) => res.status(404).json({ ok: false, code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" }));
  app.use(errorHandler);

  return app;
}

export { createApp };
