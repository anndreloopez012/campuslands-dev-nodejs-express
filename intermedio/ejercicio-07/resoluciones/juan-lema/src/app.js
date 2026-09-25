import express from "express";
import carsRoutes from "./routes/cars.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de autos de lujo activa" }));
app.use("/cars", carsRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
app.use(errorHandler);

export default app;
