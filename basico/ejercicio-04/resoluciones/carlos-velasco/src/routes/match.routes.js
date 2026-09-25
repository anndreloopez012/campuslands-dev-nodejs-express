import express from "express";

import {
    getMatches,
    getMatch,
    createNewMatch
} from "../controllers/match.controller.js";

const router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatch);
router.post("/", createNewMatch);

export default router;