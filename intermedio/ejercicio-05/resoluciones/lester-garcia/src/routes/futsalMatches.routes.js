import { Router } from "express";
import {
  getMatchesController,
  getMatchByIdController,
  createMatchController,
  updateMatchController,
  deleteMatchController
} from "../controllers/futsalMatches.controller.js";

const router = Router();

router.get("/matches", getMatchesController);
router.get("/matches/:id", getMatchByIdController);
router.post("/matches", createMatchController);
router.put("/matches/:id", updateMatchController);
router.delete("/matches/:id", deleteMatchController);

export default router;