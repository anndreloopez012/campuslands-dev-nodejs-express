import express from "express";
import moviesRoutes from "./routes/movies.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de peliculas de miedo activa" }));
app.use("/movies", moviesRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
