import { Router } from "express";
import {
  getLobbiesController,
  getLobbyByIdController,
  createLobbyController
} from "../controllers/battleRoyale.controller.js";

const router = Router();

router.get("/lobbies", getLobbiesController);
router.get("/lobbies/:id", getLobbyByIdController);
router.post("/lobbies", createLobbyController);

export default router;