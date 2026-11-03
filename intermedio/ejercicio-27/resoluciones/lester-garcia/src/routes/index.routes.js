import { Router } from "express";
import tournamentsRouter from "./tournaments.routes.js";

const router = Router();

router.use("/tournaments", tournamentsRouter);

export default router;
