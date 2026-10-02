import express from "express";

import {
    listarTrabajos,
    buscarTrabajo,
    registrarTrabajo
} from "../controllers/soldaduraController.js";

const router = express.Router();

router.get("/", listarTrabajos);

router.get("/:id", buscarTrabajo);

router.post("/", registrarTrabajo);

export default router;