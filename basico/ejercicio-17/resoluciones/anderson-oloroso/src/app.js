import express from "express";
import destinationsRoutes from "./routes/destinations.routes.js";

const app = express();

app.use(destinationsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;
