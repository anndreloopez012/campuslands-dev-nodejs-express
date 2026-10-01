import express from "express";

import {
    obtenerProyectos,
    obtenerProyectoPorId,
    crearProyecto
} from "../controllers/animacionController.js";

const router = express.Router();

router.get("/", obtenerProyectos);

router.get("/:id", obtenerProyectoPorId);

router.post("/", crearProyecto);

export default router;