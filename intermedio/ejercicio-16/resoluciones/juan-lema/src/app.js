import express from "express";
import authRoutes from "./routes/auth.routes.js";
import sneakersRoutes from "./routes/sneakers.routes.js";
import ordersRoutes from "./routes/orders.routes.js";

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ ok: true, message: "API de sneakers activa" }));
app.use("/auth", authRoutes);
app.use("/sneakers", sneakersRoutes);
app.use("/orders", ordersRoutes);
app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));

export default app;
