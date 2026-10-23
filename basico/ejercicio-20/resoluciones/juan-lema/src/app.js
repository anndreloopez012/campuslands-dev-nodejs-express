import express from "express";
import brushesRoutes from "./routes/brushes.routes.js";
import { jsonErrorHandler } from "./middlewares/json-error-handler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de dibujo digital activa" });
});

app.use("/brushes", brushesRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

app.use(jsonErrorHandler);

export default app;
