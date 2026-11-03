import { Router } from "express";
import {
  getOpenApiDocsController,
  getAllTournamentsController,
  getTournamentByIdController,
  createTournamentController
} from "../controllers/tournaments.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createTournamentValidator } from "../middlewares/validators/tournament.validator.js";

const router = Router();

router.get("/docs", getOpenApiDocsController);
router.get("/", getAllTournamentsController);
router.get("/:id", getTournamentByIdController);
router.post("/", validate(createTournamentValidator), createTournamentController);

export default router;
