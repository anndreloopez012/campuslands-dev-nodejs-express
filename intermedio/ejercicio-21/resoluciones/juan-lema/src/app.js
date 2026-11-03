import express from "express";
import rendersRoutes from "./routes/renders.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de animacion 3D activa" }));
app.use("/renders", rendersRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
