import { Router } from "express";
import { postLogin, getMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/login", postLogin);
router.get("/me", authenticate, getMe);

export default router;
