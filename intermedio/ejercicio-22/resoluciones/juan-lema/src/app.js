import express from "express";
import uploadsRoutes from "./routes/uploads.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.get("/health", (req, res) => res.json({ ok: true, message: "API de arquitectura 3D activa" }));
app.use("/uploads", uploadsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
app.use(errorHandler);

export default app;
