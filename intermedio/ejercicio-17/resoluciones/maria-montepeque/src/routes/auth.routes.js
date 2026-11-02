import { Router } from "express";
import { login, misPermisos } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/permisos", requireAuth, misPermisos);

export default router;
