import { Router } from "express";
import scenesRoutes from "./scenes.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, message: "API de animacion 3D activa" });
});

router.use("/scenes", scenesRoutes);

export default router;
