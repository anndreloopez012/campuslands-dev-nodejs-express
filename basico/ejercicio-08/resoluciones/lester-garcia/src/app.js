import express from "express";
import hypercarsRoutes from "./routes/hypercars.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", hypercarsRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;