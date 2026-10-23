import { Router } from "express";
import {
  getAllMatchesController,
  getMatchByIdController,
  createMatchController
} from "../controllers/futsal.controller.js";

const router = Router();

router.get("/futsal/matches", getAllMatchesController);
router.get("/futsal/matches/:id", getMatchByIdController);
router.post("/futsal/matches", createMatchController);

export default router;