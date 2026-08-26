import express from "express";
import renderRoutes from "./routes/render.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de arquitectura 3D activa" });
});

app.use("/renders", renderRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
