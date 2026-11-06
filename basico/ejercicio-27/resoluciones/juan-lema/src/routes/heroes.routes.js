import { Router } from "express";
import { getHeroes, postHero } from "../controllers/heroes.controller.js";

const router = Router();

router.get("/", getHeroes);
router.post("/", postHero);

export default router;
