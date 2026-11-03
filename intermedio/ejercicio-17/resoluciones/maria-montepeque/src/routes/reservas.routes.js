import { Router } from "express";
import { listReservas, createReserva, cancelarReserva } from "../controllers/reservas.controller.js";
import { requireAuth, requirePermiso } from "../middlewares/auth.middleware.js";

const router = Router();

// todas las de reservas piden login
router.use(requireAuth);

router.get("/", requirePermiso("reservas:ver_todas", "reservas:ver_de_mis_tours", "reservas:ver_propias"), listReservas);
router.post("/", requirePermiso("reservas:crear"), createReserva);
router.delete("/:id", requirePermiso("reservas:cancelar_todas", "reservas:cancelar_propias"), cancelarReserva);

export default router;
