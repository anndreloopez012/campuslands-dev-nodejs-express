import express from "express";
import skydiveRoutes from "./routes/skydive.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

// Middleware esencial para procesar peticiones JSON en las rutas POST
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Paracaidismo y Dropzones!"
  });
});

app.use("/api/v1", skydiveRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el sistema.`));
});

app.use(errorHandler);

export default app;