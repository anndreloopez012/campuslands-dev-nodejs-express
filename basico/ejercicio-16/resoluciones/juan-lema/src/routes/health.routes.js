import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, message: "Sneaker Store API activa" });
});

export default router;
