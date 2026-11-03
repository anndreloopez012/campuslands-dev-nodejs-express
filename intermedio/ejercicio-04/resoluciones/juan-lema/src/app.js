import express from "express";
import playersRoutes from "./routes/players.routes.js";
import squadsRoutes from "./routes/squads.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de battle royale activa" }));
app.use("/players", playersRoutes);
app.use("/squads", squadsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
