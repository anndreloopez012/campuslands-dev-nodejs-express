import { Router } from "express";
import { getMatches, getMatch, postMatch, postJoin, removeMatch, crash } from "../controllers/matches.controller.js";

const router = Router();

router.get("/", getMatches);
router.get("/:id", getMatch);
router.post("/", postMatch);
router.post("/:id/join", postJoin);
router.delete("/:id", removeMatch);
router.get("/debug/crash", crash);

export default router;
