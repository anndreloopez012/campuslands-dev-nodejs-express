import { Router } from "express";
import {
  getPlayersController,
  createPlayerController
} from "../controllers/player.controller.js";

const router = Router();

// Endpoint para obtener jugadores (admite filtro ?status=alive)
router.get("/players", getPlayersController);

// Endpoint para registrar un nuevo jugador en la partida
router.post("/players", createPlayerController);

export default router;