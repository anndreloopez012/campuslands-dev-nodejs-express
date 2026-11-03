import { Router } from "express";
import { getChampions, getChampion, postChampion } from "../controllers/champions.controller.js";

const router = Router();

router.get("/", getChampions);
router.get("/:id", getChampion);
router.post("/", postChampion);

export default router;
