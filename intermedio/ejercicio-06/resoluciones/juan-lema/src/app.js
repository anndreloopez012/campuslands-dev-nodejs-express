import express from "express";
import motorcyclesRoutes from "./routes/motorcycles.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de taller de motos activa" }));
app.use("/motorcycles", motorcyclesRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
