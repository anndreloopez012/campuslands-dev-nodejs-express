import { Router } from "express";
import {
  getApparelController,
  getApparelByIdController,
  createApparelController
} from "../controllers/apparel.controller.js";

const router = Router();

router.get("/apparel", getApparelController);
router.get("/apparel/:id", getApparelByIdController);
router.post("/apparel", createApparelController);

export default router;