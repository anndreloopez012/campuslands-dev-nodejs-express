import express from "express";

import {
    listarJugadores,
    buscarJugador,
    registrarJugador,
    borrarJugador
} from "../controllers/jugadorController.js";

const router = express.Router();

router.get("/", listarJugadores);

router.get("/:id", buscarJugador);

router.post("/", registrarJugador);

router.delete("/:id", borrarJugador);

export default router;