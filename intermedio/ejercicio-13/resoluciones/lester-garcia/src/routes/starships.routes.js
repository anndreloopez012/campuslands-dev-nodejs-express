import { Router } from "express";
import {
  getStarshipsController,
  getStarshipByIdController,
  createStarshipController,
  deleteStarshipController
} from "../controllers/starships.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createStarshipValidator } from "../middlewares/validators/starship.validator.js";

const router = Router();

router.get("/", getStarshipsController);
router.get("/:id", getStarshipByIdController);
router.post("/", validate(createStarshipValidator), createStarshipController);
router.delete("/:id", deleteStarshipController);

export default router;