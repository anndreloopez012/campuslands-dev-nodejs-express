import { Router } from "express";
import {
  getArchvizProjectsController,
  getArchvizProjectByIdController,
  createArchvizProjectController,
  getArchvizStatsController
} from "../controllers/archviz.controller.js";

const router = Router();

router.get("/archviz/stats", getArchvizStatsController);
router.get("/archviz", getArchvizProjectsController);
router.get("/archviz/:id", getArchvizProjectByIdController);
router.post("/archviz", createArchvizProjectController);

export default router;