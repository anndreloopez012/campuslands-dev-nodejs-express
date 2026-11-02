import { Router } from "express";
import { postRegister, postLogin, postHashDemo } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", postRegister);
router.post("/login", postLogin);
router.post("/hash-demo", postHashDemo);

export default router;
