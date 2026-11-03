import { Router } from "express";
import { getManualController } from "../controllers/mechanic.controller.js";

const router = Router();

router.get("/manuals/:model", getManualController);

export default router;