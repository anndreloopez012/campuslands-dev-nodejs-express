import express from "express";
import carRoutes from "./routes/cars.routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Autos de Lujo (Middleware de Errores Avanzado)!",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/dealership`, carRoutes);

// Manejador para endpoints no existentes
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el concesionario.`));
});

// Middleware Global de Errores: DEBE ser siempre el último middleware registrado
app.use(errorHandler);

export default app;