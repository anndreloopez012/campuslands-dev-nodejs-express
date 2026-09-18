import express from "express";
import authRoutes from "./routes/auth.routes.js";
import toursRoutes from "./routes/tours.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de viajes y turismo activa" }));
app.use("/auth", authRoutes);
app.use("/tours", toursRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
