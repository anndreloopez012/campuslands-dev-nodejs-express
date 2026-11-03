import { Router } from "express";
import { postFormulaAnalysis, postReactionCheck } from "../controllers/analysis.controller.js";

const router = Router();

router.post("/formula", postFormulaAnalysis);
router.post("/reaction", postReactionCheck);

export default router;
