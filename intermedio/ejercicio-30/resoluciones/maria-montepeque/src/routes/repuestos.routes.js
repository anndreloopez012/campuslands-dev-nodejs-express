import { Router } from "express";
import * as repuestos from "../controllers/repuestos.controller.js";
import { requireAuth, requireRol } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", repuestos.listar);
router.patch("/:id/stock", requireRol("admin"), repuestos.cambiarStock);

export default router;
