import { Router } from "express";
import {
  getPlayersController,
  getPlayerByIdController,
  createPlayerController
} from "../controllers/players.controller.js";

const router = Router();

router.get("/", getPlayersController);
router.get("/:id", getPlayerByIdController);
router.post("/", createPlayerController);

export default router;