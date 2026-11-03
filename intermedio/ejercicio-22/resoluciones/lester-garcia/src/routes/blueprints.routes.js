import { Router } from "express";
import {
  getAllBlueprintsController,
  getBlueprintByIdController,
  uploadBlueprintController
} from "../controllers/blueprints.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createBlueprintValidator } from "../middlewares/validators/blueprint.validator.js";
import { simulateFileUploadMiddleware } from "../middlewares/fileUploadSimulator.middleware.js";

const router = Router();

router.get("/", getAllBlueprintsController);
router.get("/:id", getBlueprintByIdController);
router.post(
  "/upload",
  validate(createBlueprintValidator),
  simulateFileUploadMiddleware,
  uploadBlueprintController
);

export default router;
