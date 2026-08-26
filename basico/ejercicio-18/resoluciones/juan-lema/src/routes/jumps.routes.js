import { Router } from "express";
import { getJumps, registerJump } from "../controllers/jumps.controller.js";

const router = Router();

router.get("/", getJumps);
router.post("/", registerJump);

export default router;
