import express from "express";
import { publicConfig } from "./config/index.js";
import bookingsRoutes from "./routes/bookings.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: `${publicConfig.studio.name} activo` }));
app.get("/config", (req, res) => res.json({ ok: true, data: publicConfig }));
app.use("/bookings", bookingsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
