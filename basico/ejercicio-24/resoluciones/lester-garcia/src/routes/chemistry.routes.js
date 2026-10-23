import { Router } from "express";
import {
  getAllCompoundsController,
  getCompoundByIdController,
  createCompoundController,
  updateCompoundController,
  deleteCompoundController
} from "../controllers/chemistry.controller.js";

const router = Router();

router.get("/compounds", getAllCompoundsController);
router.get("/compounds/:id", getCompoundByIdController);
router.post("/compounds", createCompoundController);
router.put("/compounds/:id", updateCompoundController);
router.delete("/compounds/:id", deleteCompoundController);

export default router;