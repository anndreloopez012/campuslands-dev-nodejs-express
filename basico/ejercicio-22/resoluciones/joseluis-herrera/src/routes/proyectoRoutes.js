import express from "express";

import {
    listarProyectos,
    buscarProyecto,
    registrarProyecto
} from "../controllers/proyectoController.js";

const router = express.Router();

router.get("/", listarProyectos);

router.get("/:id", buscarProyecto);

router.post("/", registrarProyecto);

export default router;