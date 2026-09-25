import { Router } from "express";
import ordersRoutes from "./orders.routes.js";
import config from "../config/index.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API taller de motos activa", env: config.env });
});

router.use("/orders", ordersRoutes);

export default router;
