import express from "express";
import toursRoutes from "./routes/tours.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

// Mensaje de bienvenida en la raíz
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Viajes y Turismo!"
  });
});

// Rutas base
app.use("/api/v1", toursRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no fue encontrada.`));
});

// Middleware Global de Errores
app.use(errorHandler);

export default app;