import { Router } from "express";
import {
  getAllMatchesController,
  getMatchByIdController,
  createMatchController
} from "../controllers/moba.controller.js";

const router = Router();

router.get("/moba/matches", getAllMatchesController);
router.get("/moba/matches/:id", getMatchByIdController);
router.post("/moba/matches", createMatchController);

export default router;