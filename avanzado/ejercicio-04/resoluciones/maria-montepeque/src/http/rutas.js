import { Router } from "express";
import * as c from "./controlador.js";

const router = Router();

router.get("/partidas/:id", c.ver);
router.post("/partidas/:id/jugadores/:gamertag/recoger", c.recoger);
router.post("/partidas/:id/jugadores/:gamertag/usar", c.usar);
router.post("/partidas/:id/jugadores/:gamertag/disparar", c.disparar);

router.get("/errores", c.listarErrores);
router.get("/errores/:slug", c.verError);

export default router;
