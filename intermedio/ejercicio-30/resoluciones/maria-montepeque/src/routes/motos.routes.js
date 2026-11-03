import { Router } from "express";
import * as motos from "../controllers/motos.controller.js";
import { requireAuth, requireRol } from "../middlewares/auth.js";

const router = Router();

// todo el taller pide login
router.use(requireAuth);

router.get("/", motos.listar);
router.post("/", requireRol("recepcion", "admin"), motos.crear);
router.get("/:id", motos.ver);

// subrecurso: ordenes de una moto
router.get("/:id/ordenes", motos.listarOrdenes);
router.post("/:id/ordenes", requireRol("recepcion", "admin"), motos.crearOrden);

export default router;
