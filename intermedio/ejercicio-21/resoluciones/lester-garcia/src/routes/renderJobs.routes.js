import { Router } from "express";
import {
  getAllRenderJobsController,
  getRenderJobByIdController,
  enqueueRenderJobController
} from "../controllers/renderJobs.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createRenderJobValidator } from "../middlewares/validators/renderJob.validator.js";

const router = Router();

router.get("/", getAllRenderJobsController);
router.get("/:id", getRenderJobByIdController);
router.post("/", validate(createRenderJobValidator), enqueueRenderJobController);

export default router;
