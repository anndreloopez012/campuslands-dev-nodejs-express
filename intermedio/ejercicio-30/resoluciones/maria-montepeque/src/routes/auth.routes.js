import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/login", auth.login);
router.get("/yo", requireAuth, auth.yo);

export default router;
