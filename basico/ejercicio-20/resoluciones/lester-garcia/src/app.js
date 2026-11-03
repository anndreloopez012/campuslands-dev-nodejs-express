import express from "express";
import artworkRoutes from "./routes/artworks.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

// Middleware esencial: Parseador de cuerpo JSON para peticiones POST/PUT/PATCH
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Dibujo Digital e Ilustración!"
  });
});

app.use("/api/v1", artworkRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el servidor.`));
});

// Middleware Global de Errores (incluye captura de JSON sintácticamente corrupto)
app.use(errorHandler);

export default app;