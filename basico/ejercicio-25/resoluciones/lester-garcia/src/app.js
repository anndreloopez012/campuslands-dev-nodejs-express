import express from "express";
import rpgRoutes from "./routes/rpg.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Personajes RPG (HTTP Status Codes Master)!"
  });
});

app.use("/api/v1", rpgRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el reino.`));
});

app.use(errorHandler);

export default app;