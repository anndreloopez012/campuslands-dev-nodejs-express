import express from "express";
import mobaRoutes from "./routes/moba.routes.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

// Middleware global de logs simples
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Torneos MOBA Esports (Simple Logging)!"
  });
});

app.use("/api/v1", mobaRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en la arena MOBA.`));
});

app.use(errorHandler);

export default app;