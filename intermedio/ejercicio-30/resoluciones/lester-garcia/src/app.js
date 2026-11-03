import express from "express";
import { config } from "./config/env.config.js";
import apiRouter from "./routes/index.routes.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(requestIdMiddleware);
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    requestId: req.id,
    message: `¡Bienvenido a ${config.workshop.name} — API Proyecto Integrador Intermedio! 🏍️🔧`,
    environment: config.server.nodeEnv
  });
});

app.use(`/api/${config.server.apiVersion}`, apiRouter);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en ${config.workshop.name}.`));
});

app.use(errorHandler);

export default app;
