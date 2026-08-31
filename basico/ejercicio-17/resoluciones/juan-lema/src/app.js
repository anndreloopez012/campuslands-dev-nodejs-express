import express from "express";
import destinationsRoutes from "./routes/destinations.routes.js";

const app = express();

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de viajes y turismo activa" });
});

app.use("/destinations", destinationsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
