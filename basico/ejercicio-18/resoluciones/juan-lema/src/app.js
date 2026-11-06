import express from "express";
import jumpsRoutes from "./routes/jumps.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de paracaidismo activa" });
});

app.use("/jumps", jumpsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
