import express from "express";
import kickboxingRoutes from "./routes/kickboxing.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", kickboxingRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;