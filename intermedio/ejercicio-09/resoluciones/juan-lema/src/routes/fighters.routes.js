import { Router } from "express";
import { getFighters, getFighter, postFighter } from "../controllers/fighters.controller.js";

const router = Router();

router.get("/", getFighters);
router.get("/:id", getFighter);
router.post("/", postFighter);

export default router;
