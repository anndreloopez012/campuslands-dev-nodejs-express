import { Router } from "express";
import {
  getAllMatchesController,
  getMatchByIdController,
  createMatchController,
  deleteMatchController
} from "../controllers/matches.controller.js";

const router = Router();

router.get("/matches", getAllMatchesController);
router.get("/matches/:id", getMatchByIdController);
router.post("/matches", createMatchController);
router.delete("/matches/:id", deleteMatchController);

export default router;