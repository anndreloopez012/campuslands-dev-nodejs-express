import { Router } from "express";
import {
  getAllRepairsController,
  getRepairByIdController,
  createRepairController,
  updateRepairController,
  deleteRepairController
} from "../controllers/workshop.controller.js";

const router = Router();

router.get("/workshop/repairs", getAllRepairsController);
router.get("/workshop/repairs/:id", getRepairByIdController);
router.post("/workshop/repairs", createRepairController);
router.put("/workshop/repairs/:id", updateRepairController);
router.delete("/workshop/repairs/:id", deleteRepairController);

export default router;