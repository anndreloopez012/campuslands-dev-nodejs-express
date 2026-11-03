import express from "express";
import apiRouter from "./routes/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

// Endpoint de salud general
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    status: "UP",
    supportedVersions: ["v1 (deprecated)", "v2 (current)"]
  });
});

// Ruta sugerida por la guía del ejercicio
app.get("/avanzado/ejercicio-01", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "diseno API versionada",
    theme: "videojuegos RPG",
    endpoints: {
      v1: "/api/v1/heroes",
      v2: "/api/v2/heroes"
    }
  });
});

// Enrutador principal versionado (/api/v1 y /api/v2)
app.use("/api", apiRouter);

// Manejador de rutas inexistentes (404)
app.use((req, res, next) => {
  next(
    new NotFoundError(
      `La ruta '${req.originalUrl}' no existe. Consulta /api/v1/heroes o /api/v2/heroes.`
    )
  );
});

// Middleware global de manejo de errores
app.use(errorHandler);

export default app;
