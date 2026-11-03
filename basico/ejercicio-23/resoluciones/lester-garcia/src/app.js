import express from "express";
import weldingRoutes from "./routes/welding.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { NotFoundError } from "./utils/customErrors.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "¡Bienvenido a la API de Soldadura e Inspección Industrial (In-Memory State)!"
  });
});

app.use("/api/v1", weldingRoutes);

app.use((req, res, next) => {
  next(new NotFoundError(`La ruta '${req.originalUrl}' no existe en el sistema.`));
});

app.use(errorHandler);

export default app;