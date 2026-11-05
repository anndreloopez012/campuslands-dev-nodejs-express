import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, topic: "primer servidor Express" });
});

export default router;
