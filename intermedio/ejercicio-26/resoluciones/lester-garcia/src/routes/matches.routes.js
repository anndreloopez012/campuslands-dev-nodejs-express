import { Router } from "express";
import {
  getAllMatchesController,
  getMatchByIdController,
  registerMatchController
} from "../controllers/matches.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createMatchValidator } from "../middlewares/validators/match.validator.js";

const router = Router();

router.get("/", getAllMatchesController);
router.get("/:id", getMatchByIdController);
router.post("/", validate(createMatchValidator), registerMatchController);

export default router;
