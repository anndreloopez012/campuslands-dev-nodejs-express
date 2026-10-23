import express from "express";

import { getSquads } from "../controllers/squads.controller.js";

const router = express.Router();

router.get("/", getSquads);

export default router;