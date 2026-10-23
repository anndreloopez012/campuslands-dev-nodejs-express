import { Router } from "express";
import {
  getJumpsController,
  getJumpByIdController,
  createJumpController
} from "../controllers/skydive.controller.js";

const router = Router();

router.get("/jumps", getJumpsController);
router.get("/jumps/:id", getJumpByIdController);
router.post("/jumps", createJumpController);

export default router;