import express from "express";
import designsRoutes from "./routes/designs.routes.js";

const app = express();

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de tatuajes activa" });
});

app.use(designsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
