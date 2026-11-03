import express from "express";
import songsRoutes from "./routes/songs.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de musica activa" }));
app.use("/songs", songsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
