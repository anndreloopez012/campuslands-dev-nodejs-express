import express from "express";
import archvizRoutes from "./routes/archviz.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API del Estudio de Arquitectura 3D y ArchViz!"
  });
});

app.use("/api/v1", archvizRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en la plataforma ArchViz.`));
});

app.use(errorHandler);

export default app;