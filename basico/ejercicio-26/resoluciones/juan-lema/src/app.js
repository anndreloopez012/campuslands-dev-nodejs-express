import express from "express";
import matchesRoutes from "./routes/matches.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API de shooters activa" });
});

app.use("/matches", matchesRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
