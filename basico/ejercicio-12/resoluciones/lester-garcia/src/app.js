import express from "express";
import moviesRoutes from "./routes/movies.routes.js";

const app = express();

// Middleware obligatorio para parsear el body JSON
app.use(express.json());

// Montaje de rutas con prefijo API v1
app.use("/api/v1", moviesRoutes);

// Manejo centralizado de 404 (Siempre al final)
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;