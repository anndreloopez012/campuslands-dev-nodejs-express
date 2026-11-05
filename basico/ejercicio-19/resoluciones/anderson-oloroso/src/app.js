import express from "express";
import designsRoutes from "./routes/designs.routes.js";

const app = express();

app.use(designsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;
