import express from "express";
import brRoutes from "./routes/battleRoyale.routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API Battle Royale (Servicios Reutilizables)!",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}`, brRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el servidor.`));
});

app.use(errorHandler);

export default app;