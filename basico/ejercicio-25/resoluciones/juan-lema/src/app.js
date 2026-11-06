import express from "express";
import questsRoutes from "./routes/quests.routes.js";
import { sendError } from "./utils/respond.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API de misiones RPG activa" });
});

app.use("/quests", questsRoutes);

app.use((req, res) => {
  sendError(res, 404, "Ruta no encontrada");
});

export default app;
