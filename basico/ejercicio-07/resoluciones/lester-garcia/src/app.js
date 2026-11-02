import express from "express";
import carsRoutes from "./routes/cars.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", carsRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;