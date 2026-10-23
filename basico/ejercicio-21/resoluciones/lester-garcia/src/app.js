import express from "express";
import renderRoutes from "./routes/renderProject.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

// Middleware para parseo de JSON en el req.body
app.use(express.json());

// Saludo en la raíz
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API del Estudio de Animación y Renderizado 3D!"
  });
});

// Registro modular de rutas
app.use("/api/v1", renderRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en esta granja de render.`));
});

// Middleware Global de Errores
app.use(errorHandler);

export default app;