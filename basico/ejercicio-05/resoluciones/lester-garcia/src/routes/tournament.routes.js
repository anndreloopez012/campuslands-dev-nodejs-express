import { Router } from "express";
import { getTeamsController } from "../controllers/tournament.controller.js";

const router = Router();

router.get("/teams", getTeamsController);

export default router;