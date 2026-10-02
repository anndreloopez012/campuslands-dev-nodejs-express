import { Router } from 'express';
import { principal, listar, estadisticas, obtener, crear } from '../controllers/trabajos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/trabajos', listar);
router.get('/trabajos/estadisticas', estadisticas);
router.get('/trabajos/:id', obtener);
router.post('/trabajos', crear);

export default router;
