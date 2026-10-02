import express from "express";

import {
    listarPartidas,
    buscarPartida
} from "../controllers/partidaController.js";

const router = express.Router();

router.get("/", listarPartidas);

router.get("/:id", buscarPartida);

export default router;