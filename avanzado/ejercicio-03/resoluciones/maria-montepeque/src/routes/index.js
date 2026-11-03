import { Router } from "express";
import * as c from "../controllers/moba.controller.js";
import { validar } from "../middlewares/validar.js";
import { idParams } from "../schemas/comunes.schema.js";
import { campeonCrear, campeonEditar, campeonesQuery } from "../schemas/campeon.schema.js";
import { partidaCrear } from "../schemas/partida.schema.js";

// leyendo las rutas se ve que valida cada una
const router = Router();

router.get("/campeones", validar({ query: campeonesQuery }), c.listarCampeones);
router.post("/campeones", validar({ body: campeonCrear }), c.crearCampeon);
router.get("/campeones/:id", validar({ params: idParams }), c.verCampeon);
router.patch("/campeones/:id", validar({ params: idParams, body: campeonEditar }), c.editarCampeon);

router.post("/partidas", validar({ body: partidaCrear }), c.registrarPartida);
router.get("/partidas/:id", validar({ params: idParams }), c.verPartida);

router.get("/schemas", c.listarSchemas);
router.get("/schemas/:nombre", c.verSchema);

export default router;
