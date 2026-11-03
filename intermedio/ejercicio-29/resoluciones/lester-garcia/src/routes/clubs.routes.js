import { Router } from "express";
import {
  getStandingsController,
  getClubByIdController,
  registerClubController
} from "../controllers/clubs.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createClubValidator } from "../middlewares/validators/club.validator.js";

const router = Router();

router.get("/", getStandingsController);
router.get("/:id", getClubByIdController);
router.post("/", validate(createClubValidator), registerClubController);

export default router;
