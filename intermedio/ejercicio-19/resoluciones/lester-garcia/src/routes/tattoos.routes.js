import { Router } from "express";
import {
  getStudioConfigController,
  getAllTattoosController,
  getTattooByIdController,
  createTattooController
} from "../controllers/tattoos.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createTattooValidator } from "../middlewares/validators/tattoo.validator.js";

const router = Router();

router.get("/config", getStudioConfigController);
router.get("/", getAllTattoosController);
router.get("/:id", getTattooByIdController);
router.post("/", validate(createTattooValidator), createTattooController);

export default router;
