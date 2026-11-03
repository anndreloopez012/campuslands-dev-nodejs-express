import express from "express";

import {
    listarVideojuegos,
    buscarVideojuego,
    registrarVideojuego
} from "../controllers/videojuegoController.js";

const router = express.Router();

router.get("/", listarVideojuegos);

router.get("/:id", buscarVideojuego);

router.post("/", registrarVideojuego);

export default router;