import express from "express";
import jobsRoutes from "./routes/jobs.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API de colas de taller de motos activa" });
});

app.use("/diagnostics/jobs", jobsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
