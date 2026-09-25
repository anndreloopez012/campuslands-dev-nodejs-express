import express from "express";
import { createAuthService } from "./services/auth.service.js";
import { createMotorcyclesService, SEED_MOTORCYCLES } from "./services/motorcycles.service.js";
import { createWorkOrdersService } from "./services/work-orders.service.js";
import { createAuthController } from "./controllers/auth.controller.js";
import { createMotorcyclesController } from "./controllers/motorcycles.controller.js";
import { createWorkOrdersController } from "./controllers/work-orders.controller.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createMotorcyclesRouter } from "./routes/motorcycles.routes.js";
import { createWorkOrdersRouter } from "./routes/work-orders.routes.js";
import { createAuthenticate } from "./middlewares/authenticate.js";
import { errorHandler } from "./middlewares/error-handler.js";

function createApp({
  jwtSecret = "dev-secret-change-me",
  jwtExpiresIn = "15m",
  auth = createAuthService({ jwtSecret, jwtExpiresIn }),
  motorcycles = createMotorcyclesService({ seed: SEED_MOTORCYCLES }),
  workOrders = createWorkOrdersService({ motorcycles }),
} = {}) {
  const app = express();
  const authenticate = createAuthenticate(auth);

  app.disable("x-powered-by");
  app.use(express.json());
  app.get("/health", (req, res) => res.json({ ok: true, message: "API de taller de motos activa" }));
  app.use("/auth", createAuthRouter({ controller: createAuthController({ auth }), authenticate }));
  app.use("/motorcycles", createMotorcyclesRouter({ controller: createMotorcyclesController({ motorcycles }), authenticate }));
  app.use("/work-orders", createWorkOrdersRouter({ controller: createWorkOrdersController({ workOrders }), authenticate }));
  app.use((req, res) => res.status(404).json({ ok: false, code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" }));
  app.use(errorHandler);

  return app;
}

export { createApp };
