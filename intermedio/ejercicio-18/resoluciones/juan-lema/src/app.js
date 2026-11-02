import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de paracaidismo activa" }));
app.use("/auth", authRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
