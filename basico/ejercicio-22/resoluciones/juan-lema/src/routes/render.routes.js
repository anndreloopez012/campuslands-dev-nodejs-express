import { Router } from "express";
import { postRenderBudget } from "../controllers/render.controller.js";

const router = Router();

router.post("/budget", postRenderBudget);

export default router;
