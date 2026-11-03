import express from "express";
import apiRouter from "./routes/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, status: "UP", exercise: "avanzado-15" });
});

app.get("/avanzado/ejercicio-15", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "seguridad de headers",
    theme: "comida urbana",
    mainEndpoint: "/api/v1/street-orders"
  });
});

app.use("/api/v1", apiRouter);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en este servicio.`));
});

app.use(errorHandler);

export default app;
