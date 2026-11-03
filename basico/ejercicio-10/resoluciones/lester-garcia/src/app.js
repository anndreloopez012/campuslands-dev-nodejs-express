import express from "express";
import pingpongRoutes from "./routes/pingpong.routes.js";

const app = express();

// Middleware obligatorio para procesar el cuerpo JSON de peticiones POST
app.use(express.json());

// Declaración del router principal con el prefijo API v1
app.use("/api/v1", pingpongRoutes);

// Manejo centralizado de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;