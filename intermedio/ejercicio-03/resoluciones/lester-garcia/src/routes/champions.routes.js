import { Router } from "express";
import {
  getChampionsController,
  getChampionByIdController,
  createChampionController,
  updateChampionController,
  deleteChampionController
} from "../controllers/champions.controller.js";

const router = Router();

router.get("/champions", getChampionsController);
router.get("/champions/:id", getChampionByIdController);
router.post("/champions", createChampionController);
router.put("/champions/:id", updateChampionController);
router.delete("/champions/:id", deleteChampionController);

export default router;