import { Router } from "express";
import {
  getPlayersController,
  getPlayerByIdController
} from "../controllers/players.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { playerQueryValidator } from "../middlewares/validators/query.validator.js";

const router = Router();

router.get("/players", validate(playerQueryValidator), getPlayersController);
router.get("/players/:id", getPlayerByIdController);

export default router;