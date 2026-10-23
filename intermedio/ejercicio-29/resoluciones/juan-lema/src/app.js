import express from "express";
import { createMatchesService } from "./services/matches.service.js";
import { createMatchesController } from "./controllers/matches.controller.js";
import { createMatchesRouter } from "./routes/matches.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

function createApp({ matches = createMatchesService() } = {}) {
  const app = express();

  app.use(express.json());
  app.get("/health", (req, res) => res.json({ ok: true, message: "API de futbol activa" }));
  app.use("/matches", createMatchesRouter({ controller: createMatchesController({ matches }) }));
  app.use((req, res) => res.status(404).json({ ok: false, code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" }));
  app.use(errorHandler);

  return app;
}

export { createApp };
