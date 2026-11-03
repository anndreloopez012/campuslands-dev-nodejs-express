import express from "express";
import musicRoutes from "./routes/music.routes.js";

const app = express();

// Middleware esencial para procesar bodies en JSON
app.use(express.json());

// Registro de las rutas de la API bajo el prefijo /api/v1
app.use("/api/v1", musicRoutes);

// Middleware para manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;