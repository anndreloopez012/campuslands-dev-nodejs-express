import express from "express";
import rpgClassRoutes from "./routes/rpgClass.routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API del Reino RPG (Arquitectura por Capas Estricta)!",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}`, rpgClassRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el reino.`));
});

app.use(errorHandler);

export default app;