import express from "express";
import hypercarRoutes from "./routes/hypercars.routes.js";
import { requestIdMiddleware } from "./middlewares/requestId.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

// 1. PRIMER MIDDLEWARE: Asignación y propagación del Request ID
app.use(requestIdMiddleware);

// 2. Middleware de parseo de JSON
app.use(express.json());

// 3. Logger transversal (consume req.id)
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    requestId: req.id,
    message: "¡Bienvenido a la API de Hiperdeportivos (Request ID & Traceability)!",
    environment: process.env.NODE_ENV || "development"
  });
});

const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}/factory`, hypercarRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en la fábrica.`));
});

// Middleware Global de Errores (incluye req.id en la respuesta)
app.use(errorHandler);

export default app;