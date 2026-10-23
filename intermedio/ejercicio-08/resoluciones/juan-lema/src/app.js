import express from "express";
import hypercarsRoutes from "./routes/hypercars.routes.js";
import { requestId } from "./middlewares/request-id.js";

const app = express();

app.use(express.json());
app.use(requestId);
app.get("/health", (req, res) => res.json({ ok: true, requestId: req.id, message: "API de hiperdeportivos activa" }));
app.use("/hypercars", hypercarsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, requestId: req.id, message: "Ruta no encontrada" }));

export default app;
