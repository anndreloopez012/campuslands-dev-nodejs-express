import { Router } from "express";
import { listTours, getTour, createTour, updateTour, deleteTour } from "../controllers/tours.controller.js";
import { requireAuth, requirePermiso } from "../middlewares/auth.middleware.js";

const router = Router();

// ver tours es publico
router.get("/", listTours);
router.get("/:id", getTour);

router.post("/", requireAuth, requirePermiso("tours:crear"), createTour);
// aqui entra el admin o el guia, el service revisa si el tour es del guia
router.patch("/:id", requireAuth, requirePermiso("tours:editar", "tours:editar_propios"), updateTour);
router.delete("/:id", requireAuth, requirePermiso("tours:borrar"), deleteTour);

export default router;
