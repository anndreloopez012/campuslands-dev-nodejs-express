import express from "express";

import {
    listarEquipos,
    buscarEquipo
} from "../controllers/equipoController.js";

const router = express.Router();

router.get("/", listarEquipos);

router.get("/:id", buscarEquipo);

export default router;