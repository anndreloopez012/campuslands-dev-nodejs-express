import { Router } from 'express';
import { principal, listar, obtener, crear } from '../controllers/equipos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/equipos', listar);
router.get('/equipos/:id', obtener);
router.post('/equipos', crear);

export default router;
