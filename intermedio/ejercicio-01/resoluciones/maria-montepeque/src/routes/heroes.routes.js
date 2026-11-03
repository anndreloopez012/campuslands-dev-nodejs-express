import { Router } from "express";
import { listHeroes, getHero, createHero } from "../controllers/heroes.controller.js";

const router = Router();

router.get("/", listHeroes);
router.get("/:id", getHero);
router.post("/", createHero);

export default router;
