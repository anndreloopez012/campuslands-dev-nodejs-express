import { Router } from "express";
import * as c from "../controllers/battle.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/login", c.login);
router.get("/auth/yo", requireAuth, c.yo);

router.post("/escuadras", requireAuth, c.crearEscuadra);
router.get("/escuadras/:id", c.verEscuadra);
router.post("/escuadras/:id/unirse", requireAuth, c.unirseEscuadra);

router.post("/partidas", requireAuth, c.crearPartida);
router.get("/partidas/:id", c.verPartida);
router.post("/partidas/:id/escuadras", requireAuth, c.inscribir);
router.post("/partidas/:id/iniciar", requireAuth, c.iniciar);
router.post("/partidas/:id/eliminaciones", requireAuth, c.eliminar);
router.get("/partidas/:id/ranking", c.ranking);

export default router;
