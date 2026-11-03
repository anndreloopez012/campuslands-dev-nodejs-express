import { Router } from "express";
import {
  getHttpExamplesController,
  getAllLoadoutsController,
  getLoadoutByIdController,
  createLoadoutController
} from "../controllers/loadouts.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createLoadoutValidator } from "../middlewares/validators/loadout.validator.js";

const router = Router();

router.get("/examples", getHttpExamplesController);
router.get("/", getAllLoadoutsController);
router.get("/:id", getLoadoutByIdController);
router.post("/", validate(createLoadoutValidator), createLoadoutController);

export default router;
