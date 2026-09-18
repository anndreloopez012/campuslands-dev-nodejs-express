import { Router } from "express";
import playersRoutes from "./players.routes.js";
import weaponsRoutes from "./weapons.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de shooter competitivo activa" });
});

router.use("/players", playersRoutes);
router.use("/weapons", weaponsRoutes);

export default router;
