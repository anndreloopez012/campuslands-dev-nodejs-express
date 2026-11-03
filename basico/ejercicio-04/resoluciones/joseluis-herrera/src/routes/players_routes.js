import express from "express";
import playersController from "../controllers/player_controllers.js";

const router = express.Router();

router.get("/", playersController.getPlayers);

export default router;