import express from "express";
import brushesRoutes from "./routes/brushes.routes.js";
import jsonErrorHandler from "./middlewares/json-error-handler.js";

const app = express();

app.use(express.json());
app.use(brushesRoutes);
app.use(jsonErrorHandler);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;
