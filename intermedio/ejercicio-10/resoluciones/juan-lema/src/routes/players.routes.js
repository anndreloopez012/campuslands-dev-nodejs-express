import { Router } from "express";
import { getPlayers, getPlayer, postPlayer } from "../controllers/players.controller.js";

const router = Router();

router.get("/", getPlayers);
router.get("/:id", getPlayer);
router.post("/", postPlayer);

export default router;
