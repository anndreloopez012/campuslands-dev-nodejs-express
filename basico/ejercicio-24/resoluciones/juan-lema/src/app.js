import express from "express";
import compoundsRoutes from "./routes/compounds.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de formulas quimicas activa" });
});

app.use("/compounds", compoundsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
