import { Router } from "express";
import { getWelds, getWeld, postWeld, patchWeldStatus } from "../controllers/welds.controller.js";

const router = Router();

router.get("/", getWelds);
router.get("/:id", getWeld);
router.post("/", postWeld);
router.patch("/:id/status", patchWeldStatus);

export default router;
