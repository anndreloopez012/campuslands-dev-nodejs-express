import { Router } from "express";
import { getCaptains, getCaptain, postCaptain } from "../controllers/captains.controller.js";

const router = Router();

router.get("/", getCaptains);
router.get("/:id", getCaptain);
router.post("/", postCaptain);

export default router;
