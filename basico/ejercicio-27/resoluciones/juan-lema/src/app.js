import express from "express";
import heroesRoutes from "./routes/heroes.routes.js";
import { requestLogger } from "./middlewares/request-logger.js";

const app = express();

app.use(requestLogger);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API MOBA activa" });
});

app.use("/heroes", heroesRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
