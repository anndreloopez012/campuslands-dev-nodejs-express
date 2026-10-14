import express from "express";
import futsalRoutes from "./routes/futsalMatches.routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Fútbol Sala (In-Memory Repository Pattern)!",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/futsal`, futsalRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el sistema.`));
});

app.use(errorHandler);

export default app;