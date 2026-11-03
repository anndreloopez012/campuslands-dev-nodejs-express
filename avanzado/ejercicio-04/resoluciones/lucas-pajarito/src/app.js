import express from "express";
import squadsRoutes from "./routes/squads.routes.js";
import { domainErrorHandler } from "./middlewares/domain-error-handler.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API Battle Royale con errores de dominio activa" });
});

app.use("/squads", squadsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" });
});

app.use(domainErrorHandler);

export default app;
