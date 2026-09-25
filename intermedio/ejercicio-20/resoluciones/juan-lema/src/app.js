import express from "express";
import artworksRoutes from "./routes/artworks.routes.js";
import { corsPolicy, corsSettings } from "./middlewares/cors-policy.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(corsPolicy);
app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de dibujo digital activa" }));
app.get("/cors", (req, res) => res.json({ ok: true, data: corsSettings }));
app.use("/artworks", artworksRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
app.use(errorHandler);

export default app;
