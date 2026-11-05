import { Router } from "express";
import { listJumps, createJump } from "../controllers/jumps.controller.js";

const router = Router();

router.get("/jumps", listJumps);
router.post("/jumps", createJump);

export default router;
