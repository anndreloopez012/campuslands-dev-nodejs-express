import { Router } from "express";
import { postLogin, getMe, postLogout } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/login", postLogin);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, postLogout);

export default router;
