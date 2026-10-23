import express from "express";
import booksRoutes from "./routes/books.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

// Rutas de la API
app.use("/api/v1", booksRoutes);

// Manejo de 404 para rutas inexistentes
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe.`));
});

// Middleware Global de Errores
app.use(errorHandler);

export default app;