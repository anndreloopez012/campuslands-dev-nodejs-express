import { Router } from "express";
import {
  getAllWeldsController,
  getWeldByIdController,
  createWeldController
} from "../controllers/welds.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createWeldValidator } from "../middlewares/validators/weld.validator.js";

const router = Router();

router.get("/", getAllWeldsController);
router.get("/:id", getWeldByIdController);
router.post("/", validate(createWeldValidator), createWeldController);

export default router;
