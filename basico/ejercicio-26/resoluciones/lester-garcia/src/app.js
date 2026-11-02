import express from "express";
import matchRoutes from "./routes/matches.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Shooters Competitivos (HTTP Status Codes Advanced)!"
  });
});

app.use("/api/v1", matchRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en la plataforma de esports.`));
});

app.use(errorHandler);

export default app;