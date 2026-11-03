import { Router } from "express";
import {
  getPlayersController,
  getPlayerByIdController,
  getPlayerStatsController,
  createPlayerController
} from "../controllers/pingpong.controller.js";

const router = Router();

router.get("/players", getPlayersController);
router.get("/players/:id", getPlayerByIdController);
router.get("/players/:id/stats", getPlayerStatsController);
router.post("/players", createPlayerController);

export default router;