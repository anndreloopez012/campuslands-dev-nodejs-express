import { Router } from "express";
import {
  getProjectsController,
  getProjectByIdController,
  createProjectController
} from "../controllers/renderProject.controller.js";

const router = Router();

// Mapeo limpio de endpoints
router.get("/render-projects", getProjectsController);
router.get("/render-projects/:id", getProjectByIdController);
router.post("/render-projects", createProjectController);

export default router;