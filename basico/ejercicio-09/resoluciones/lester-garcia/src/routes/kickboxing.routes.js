import { Router } from "express";
import {
  getFightersController,
  createFighterController
} from "../controllers/kickboxing.controller.js";

const router = Router();

router.get("/fighters", getFightersController);
router.post("/fighters", createFighterController);

export default router;