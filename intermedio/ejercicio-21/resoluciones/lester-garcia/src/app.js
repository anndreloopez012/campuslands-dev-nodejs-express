import express from "express";
import apiRouter from "./routes/index.routes.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(requestIdMiddleware);
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiterMiddleware);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    requestId: req.id,
    message: "¡Bienvenido a la API de Granja de Renderizado y Animación 3D (Rate Limit Conceptual)! 🎬🧊",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}`, apiRouter);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en la granja de renderizado 3D.`));
});

app.use(errorHandler);

export default app;
