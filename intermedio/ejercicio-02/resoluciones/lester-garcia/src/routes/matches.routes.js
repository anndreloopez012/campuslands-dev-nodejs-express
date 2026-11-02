import { Router } from "express";
import {
  getMatchesController,
  getMatchByIdController,
  createMatchController
} from "../controllers/matches.controller.js";

const router = Router();

router.get("/", getMatchesController);
router.get("/:id", getMatchByIdController);
router.post("/", createMatchController);

export default router;