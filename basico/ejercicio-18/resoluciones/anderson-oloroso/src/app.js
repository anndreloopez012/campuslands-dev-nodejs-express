import express from "express";
import jumpsRoutes from "./routes/jumps.routes.js";

const app = express();

app.use(express.json());
app.use(jumpsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;
