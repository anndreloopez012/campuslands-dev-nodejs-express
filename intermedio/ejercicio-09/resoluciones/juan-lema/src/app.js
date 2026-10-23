import express from "express";
import fightersRoutes from "./routes/fighters.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de kickboxing activa" }));
app.use("/fighters", fightersRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
