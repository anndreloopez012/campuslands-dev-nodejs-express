import { Router } from "express";
import { registerBrush } from "../controllers/brushes.controller.js";

const router = Router();

router.post("/", registerBrush);

export default router;
