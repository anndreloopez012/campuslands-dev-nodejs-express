import { Router } from 'express';
import { principal, jugadores, partido, resumen } from '../controllers/partidos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/jugadores', jugadores);
router.get('/partidos/:id', partido);
router.get('/resumen', resumen);

export default router;
