import { Router } from "express";
import {
    listPrecios,
    crearCotizacion,
    listTrabajos,
    getTrabajo,
    crearTrabajo,
    cambiarEstado
} from "../controllers/taller.controller.js";

const router = Router();

router.get("/precios", listPrecios);
router.post("/cotizaciones", crearCotizacion);

router.get("/trabajos", listTrabajos);
router.post("/trabajos", crearTrabajo);
router.get("/trabajos/:id", getTrabajo);
router.patch("/trabajos/:id/estado", cambiarEstado);

export default router;
