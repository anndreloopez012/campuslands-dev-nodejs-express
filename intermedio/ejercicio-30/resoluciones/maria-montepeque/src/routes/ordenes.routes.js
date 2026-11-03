import { Router } from "express";
import * as ordenes from "../controllers/ordenes.controller.js";
import { requireAuth, requireRol } from "../middlewares/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", ordenes.listar);
router.get("/:id", ordenes.ver);
router.patch("/:id/asignar", requireRol("admin"), ordenes.asignar);
// quien puede cambiar a cada estado lo revisa el service, depende del estado
router.patch("/:id/estado", ordenes.cambiarEstado);
router.post("/:id/repuestos", requireRol("mecanico", "admin"), ordenes.agregarRepuesto);

export default router;
