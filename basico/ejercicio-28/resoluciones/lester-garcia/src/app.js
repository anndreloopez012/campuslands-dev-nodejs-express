import express from "express";
import battleRoutes from "./routes/battleRoyale.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API del Servidor de Battle Royale (Environment Config)!",
    environment: process.env.NODE_ENV || "development"
  });
});

// Utiliza la versión de la API definida por variable de entorno o por defecto 'v1'
const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}`, battleRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el servidor.`));
});

app.use(errorHandler);

export default app;