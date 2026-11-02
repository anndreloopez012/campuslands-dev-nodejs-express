import { Router } from "express";
import {
  getAllCarsController,
  getCarByIdController,
  createCarController,
  deleteCarController,
  triggerCrashController
} from "../controllers/cars.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createCarValidator } from "../middlewares/validators/car.validator.js";

const router = Router();

router.get("/cars", getAllCarsController);
router.get("/cars/trigger-crash", triggerCrashController); // Ruta de prueba para error 500
router.get("/cars/:id", getCarByIdController);
router.post("/cars", validate(createCarValidator), createCarController);
router.delete("/cars/:id", deleteCarController);

export default router;