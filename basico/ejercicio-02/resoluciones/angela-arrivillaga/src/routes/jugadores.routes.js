import { Router } from 'express';
import { principal, listarScripts, obtenerJugador } from '../controllers/jugadores.controller.js';

const router = Router();

router.get('/', principal);
router.get('/scripts', listarScripts);
router.get('/jugadores/:id', obtenerJugador);

export default router;
