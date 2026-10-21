import express from "express";
import trackRoutes from "./routes/tracks.routes.js";
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
    message: "¡Bienvenido a la API del Catálogo Musical (Búsqueda Textual Multi-Campo)!",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/music`, trackRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el catálogo.`));
});

app.use(errorHandler);

export default app;