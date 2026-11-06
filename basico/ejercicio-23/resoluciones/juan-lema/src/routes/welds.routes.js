import { Router } from "express";
import { getWelds, postWeld, deleteWeld } from "../controllers/welds.controller.js";

const router = Router();

router.get("/", getWelds);
router.post("/", postWeld);
router.delete("/:id", deleteWeld);

export default router;
