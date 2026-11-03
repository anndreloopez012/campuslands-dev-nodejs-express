import { Router } from "express";
import { getSquads, postDeploy } from "../controllers/squads.controller.js";

const router = Router();

router.get("/", getSquads);
router.post("/:id/deploy", postDeploy);

export default router;
