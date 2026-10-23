import express from "express";
import { createDropsService, SEED_DROPS } from "./services/drops.service.js";
import { createDropsController } from "./controllers/drops.controller.js";
import { createDropsRouter } from "./routes/drops.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

function createApp({ drops = createDropsService({ seed: SEED_DROPS }) } = {}) {
  const app = express();

  app.use(express.json());
  app.get("/health", (req, res) => res.json({ ok: true, message: "API de battle royale activa" }));
  app.use("/drops", createDropsRouter({ controller: createDropsController({ drops }) }));
  app.use((req, res) => res.status(404).json({ ok: false, code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" }));
  app.use(errorHandler);

  return app;
}

export { createApp };
