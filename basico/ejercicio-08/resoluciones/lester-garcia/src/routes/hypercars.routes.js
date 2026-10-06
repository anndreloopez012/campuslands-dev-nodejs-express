import { Router } from "express";
import {
  getHypercarsController,
  getTelemetryController
} from "../controllers/hypercars.controller.js";

const router = Router();

router.get("/hypercars", getHypercarsController);
router.get("/hypercars/:id/telemetry", getTelemetryController);

export default router;