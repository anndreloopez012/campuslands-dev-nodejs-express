import { Router } from "express";
import matchesRouter from "./matches.routes.js";
import playersRouter from "./players.routes.js";

const router = Router();

// Montaje de sub-routers modulares
router.use("/matches", matchesRouter);
router.use("/players", playersRouter);

export default router;