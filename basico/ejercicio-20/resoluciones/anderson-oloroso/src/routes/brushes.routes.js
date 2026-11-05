import { Router } from "express";
import { listBrushes, createBrush } from "../controllers/brushes.controller.js";

const router = Router();

router.get("/brushes", listBrushes);
router.post("/brushes", createBrush);

export default router;
