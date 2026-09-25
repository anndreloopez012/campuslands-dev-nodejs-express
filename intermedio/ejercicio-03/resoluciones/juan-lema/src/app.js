import express from "express";
import championsRoutes from "./routes/champions.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de MOBA esports activa" }));
app.use("/champions", championsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
