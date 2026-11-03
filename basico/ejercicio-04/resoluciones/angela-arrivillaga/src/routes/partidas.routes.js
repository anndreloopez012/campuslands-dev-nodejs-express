import { Router } from 'express';
import { principal, listar, puntaje } from '../controllers/partidas.controller.js';

const router = Router();

router.get('/', principal);
router.get('/jugadores', listar);
router.get('/puntaje', puntaje);

export default router;
