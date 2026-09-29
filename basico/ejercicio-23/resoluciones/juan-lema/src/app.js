import express from "express";
import weldsRoutes from "./routes/welds.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de soldadura activa" });
});

app.use("/welds", weldsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
