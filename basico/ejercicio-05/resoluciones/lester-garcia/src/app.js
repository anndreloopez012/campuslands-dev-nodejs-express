import express from "express";
import tournamentRoutes from "./routes/tournament.routes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", tournamentRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada"
  });
});

export default app;