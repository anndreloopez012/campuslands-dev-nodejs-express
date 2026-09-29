import { Router } from "express";
import { getTeams, getTeam, postTeam } from "../controllers/teams.controller.js";

const router = Router();

router.get("/", getTeams);
router.get("/:id", getTeam);
router.post("/", postTeam);

export default router;
