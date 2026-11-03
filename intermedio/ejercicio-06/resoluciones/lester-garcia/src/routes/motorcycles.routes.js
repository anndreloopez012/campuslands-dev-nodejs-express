import { Router } from "express";
import {
  getAllBikesController,
  getBikeByIdController,
  createBikeController,
  updateBikeStatusController,
  deleteBikeController
} from "../controllers/motorcycles.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import {
  createMotorcycleValidator,
  updateMotorcycleStatusValidator
} from "../middlewares/validators/motorcycle.validator.js";

const router = Router();

router.get("/motorcycles", getAllBikesController);
router.get("/motorcycles/:id", getBikeByIdController);

// Inyección del middleware de validación centralizada antes del controlador
router.post(
  "/motorcycles",
  validate(createMotorcycleValidator),
  createBikeController
);

router.patch(
  "/motorcycles/:id/status",
  validate(updateMotorcycleStatusValidator),
  updateBikeStatusController
);

router.delete("/motorcycles/:id", deleteBikeController);

export default router;