import { Router } from "express";
import {
  getFoodTrucksController,
  getFoodTruckByIdController,
  createFoodTruckController,
  deleteFoodTruckController
} from "../controllers/foodTrucks.controller.js";
import { verifyJwt } from "../middlewares/authJwt.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createFoodTruckValidator } from "../middlewares/validators/foodTruck.validator.js";

const router = Router();

// Rutas Públicas (Cualquier comensal puede consultar)
router.get("/", getFoodTrucksController);
router.get("/:id", getFoodTruckByIdController);

// Rutas Protegidas por JWT
router.post("/", verifyJwt, validate(createFoodTruckValidator), createFoodTruckController);
router.delete("/:id", verifyJwt, deleteFoodTruckController);

export default router;