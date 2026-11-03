import express from "express";
import tattooRoutes from "./routes/tattoos.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API del Estudio de Tatuajes!"
  });
});

app.use("/api/v1", tattooRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el servidor.`));
});

app.use(errorHandler);

export default app;