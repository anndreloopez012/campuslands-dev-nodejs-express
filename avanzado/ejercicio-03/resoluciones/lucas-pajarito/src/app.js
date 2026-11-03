import express from "express";
import registrationsRoutes from "./routes/registrations.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API MOBA con validacion de schemas activa" });
});

app.use("/registrations", registrationsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;
