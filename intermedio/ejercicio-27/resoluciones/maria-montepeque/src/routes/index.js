import { Router } from "express";
import {
    listEquipos,
    getEquipo,
    getJugadores,
    crearEquipo,
    registrarPartida,
    verClasificacion
} from "../controllers/liga.controller.js";
import requireApiKey from "../middlewares/api-key.middleware.js";

// todas las rutas estan en este router para que el test de docs las pueda leer
// si agregas una ruta aqui tambien hay que agregarla en docs/openapi.json
const router = Router();

router.get("/equipos", listEquipos);
router.post("/equipos", requireApiKey, crearEquipo);
router.get("/equipos/:id", getEquipo);
router.get("/equipos/:id/jugadores", getJugadores);
router.post("/partidas", requireApiKey, registrarPartida);
router.get("/clasificacion", verClasificacion);

export default router;
