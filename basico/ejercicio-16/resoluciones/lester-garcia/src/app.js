import express from "express";
import apparelRoutes from "./routes/apparel.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

// Middleware nativo de Express para parsear el cuerpo JSON
app.use(express.json());

// Endpoint de estado/saludo inicial
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Ropa y Sneakers en Express!"
  });
});

// Montaje de rutas de la API
app.use("/api/v1", apparelRoutes);

// Manejo de rutas no registradas (404)
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en esta boutique.`));
});

// Middleware Global de Errores
app.use(errorHandler);

export default app;