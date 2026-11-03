import express from "express";
import playerRoutes from "./routes/player.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", playerRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;