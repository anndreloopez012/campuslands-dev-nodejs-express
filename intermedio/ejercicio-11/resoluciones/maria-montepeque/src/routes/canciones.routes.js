import { Router } from "express";
import { listCanciones, buscarCanciones, getCancion } from "../controllers/canciones.controller.js";

const router = Router();

router.get("/", listCanciones);
// /buscar va antes de /:id para que no lo tome como id
router.get("/buscar", buscarCanciones);
router.get("/:id", getCancion);

export default router;
