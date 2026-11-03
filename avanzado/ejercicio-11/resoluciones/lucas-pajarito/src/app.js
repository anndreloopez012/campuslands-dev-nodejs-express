import express from "express";
import tracksRoutes from "./routes/tracks.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API de musica con importacion masiva activa" });
});

app.use("/tracks", tracksRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
