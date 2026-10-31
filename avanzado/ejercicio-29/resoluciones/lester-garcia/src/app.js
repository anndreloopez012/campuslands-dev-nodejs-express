import express from "express";
import apiRouter from "./routes/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, status: "UP", exercise: "avanzado-29" });
});

app.get("/health/live", (req, res) => {
  res.status(200).json({ ok: true, probe: "liveness", status: "ALIVE" });
});

app.get("/health/ready", (req, res) => {
  res.status(200).json({ ok: true, probe: "readiness", status: "READY" });
});

app.get("/avanzado/ejercicio-29", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "deploy readiness",
    theme: "futbol y futbol sala",
    mainEndpoint: "/api/v1/matches"
  });
});

app.use("/api/v1", apiRouter);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en este servicio.`));
});

app.use(errorHandler);

export default app;
