import { Router } from "express";
import matchesRouter from "./matches.routes.js";

const router = Router();

router.use("/matches", matchesRouter);

export default router;
