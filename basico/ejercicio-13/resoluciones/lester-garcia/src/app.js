import express from "express";
import spacecraftRoutes from "./routes/spacecraft.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

// Montaje de rutas
app.use("/api/v1", spacecraftRoutes);

// Intercepción de rutas no encontradas (404)
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en esta estación espacial.`));
});

// Middleware Global de Errores (Siempre debe ser el último app.use)
app.use(errorHandler);

export default app;