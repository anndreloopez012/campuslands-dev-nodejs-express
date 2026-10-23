import { Router } from "express";
import { getLobbyLimit, getDebugConfig } from "../controllers/lobby.controller.js";

const router = Router();

router.get("/limit", getLobbyLimit);
router.get("/debug/config", getDebugConfig);

export default router;
