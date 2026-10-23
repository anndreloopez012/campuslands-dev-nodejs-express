import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dishesRoutes from "./routes/dishes.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de comida urbana activa" }));
app.use("/auth", authRoutes);
app.use("/dishes", dishesRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
