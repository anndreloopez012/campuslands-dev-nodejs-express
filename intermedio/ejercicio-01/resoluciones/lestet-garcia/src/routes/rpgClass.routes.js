import { Router } from "express";
import {
  getAllClassesController,
  getClassByIdController,
  createClassController,
  updateClassController,
  deleteClassController
} from "../controllers/rpgClass.controller.js";

const router = Router();

router.get("/rpg/classes", getAllClassesController);
router.get("/rpg/classes/:id", getClassByIdController);
router.post("/rpg/classes", createClassController);
router.put("/rpg/classes/:id", updateClassController);
router.delete("/rpg/classes/:id", deleteClassController);

export default router;