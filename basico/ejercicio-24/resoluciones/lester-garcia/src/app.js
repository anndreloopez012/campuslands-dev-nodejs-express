import express from "express";
import chemistryRoutes from "./routes/chemistry.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Fórmulas y Compuestos Químicos (CRUD Básico)!"
  });
});

app.use("/api/v1", chemistryRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el laboratorio.`));
});

app.use(errorHandler);

export default app;