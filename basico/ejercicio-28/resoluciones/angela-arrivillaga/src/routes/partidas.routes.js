import { Router } from 'express';
import { principal, verConfig, listar, obtener } from '../controllers/partidas.controller.js';

const router = Router();

router.get('/', principal);
router.get('/config', verConfig);
router.get('/partidas', listar);
router.get('/partidas/:id', obtener);

export default router;
