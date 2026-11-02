import { Router } from "express";
import { getSquads } from "../controllers/squads.controller.js";

const router = Router();

router.get("/", getSquads);

export default router;
