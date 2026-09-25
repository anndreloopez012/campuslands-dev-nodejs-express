import express from "express";
import lobbyRoutes from "./routes/lobby.routes.js";
import config from "./config/index.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  if (config.logLevel === "verbose") {
    console.log(`[${config.env}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API battle royale activa", env: config.env });
});

app.use("/lobby", lobbyRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
