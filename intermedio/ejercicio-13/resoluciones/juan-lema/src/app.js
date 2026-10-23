import express from "express";
import captainsRoutes from "./routes/captains.routes.js";
import shipsRoutes from "./routes/ships.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de ciencia ficcion activa" }));
app.use("/captains", captainsRoutes);
app.use("/ships", shipsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
