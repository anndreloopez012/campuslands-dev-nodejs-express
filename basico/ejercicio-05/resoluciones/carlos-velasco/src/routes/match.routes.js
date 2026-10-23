import express from "express";

import { getAllMatches } from "../controllers/match.controller.js";

const router = express.Router();

router.get("/", getAllMatches);

export default router;