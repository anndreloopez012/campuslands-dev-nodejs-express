import { Router } from "express";
import { verStats, armarPartida, verPartidas } from "../controllers/shooter.controller.js";

const router = Router();

router.get("/jugadores/:gamertag/stats", verStats);
router.get("/partidas", verPartidas);
router.post("/partidas", armarPartida);

export default router;
