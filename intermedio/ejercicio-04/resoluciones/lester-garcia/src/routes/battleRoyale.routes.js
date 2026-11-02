import { Router } from "express";
import {
  getLobbiesController,
  getLobbyByIdController,
  createLobbyController,
  joinLobbyController
} from "../controllers/battleRoyale.controller.js";

const router = Router();

router.get("/lobbies", getLobbiesController);
router.get("/lobbies/:id", getLobbyByIdController);
router.post("/lobbies", createLobbyController);
router.post("/lobbies/:id/join", joinLobbyController);

export default router;