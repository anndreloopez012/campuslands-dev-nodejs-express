import express from "express";
import apiRouter from "./routes/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, status: "UP", exercise: "avanzado-09" });
});

app.get("/avanzado/ejercicio-09", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "streams basicos",
    theme: "kickboxing",
    mainEndpoint: "/api/v1/fights"
  });
});

app.use("/api/v1", apiRouter);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en este servicio.`));
});

app.use(errorHandler);

export default app;
