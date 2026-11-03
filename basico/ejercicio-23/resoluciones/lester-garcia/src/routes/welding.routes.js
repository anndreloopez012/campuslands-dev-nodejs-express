import { Router } from "express";
import {
  getWeldingJobsController,
  getWeldingJobByIdController,
  createWeldingJobController,
  resetWeldingMemoryController
} from "../controllers/welding.controller.js";

const router = Router();

router.get("/welding", getWeldingJobsController);
router.get("/welding/:id", getWeldingJobByIdController);
router.post("/welding", createWeldingJobController);
router.post("/welding/reset", resetWeldingMemoryController);

export default router;