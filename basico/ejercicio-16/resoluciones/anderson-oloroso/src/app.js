import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.get("/", (_req, res) => {
  res.json({ message: "👟 Bienvenido a la API de ropa y sneakers" });
});

app.use(healthRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;
