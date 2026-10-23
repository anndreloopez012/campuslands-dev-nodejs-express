import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Bienvenido a Sneaker Store API" });
});

app.use(healthRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
