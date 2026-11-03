import { Router } from "express";
import {
  getSpacecraftsController,
  getSpacecraftByIdController,
  createSpacecraftController
} from "../controllers/spacecraft.controller.js";

const router = Router();

router.get("/spacecrafts", getSpacecraftsController);
router.get("/spacecrafts/:id", getSpacecraftByIdController);
router.post("/spacecrafts", createSpacecraftController);

export default router;