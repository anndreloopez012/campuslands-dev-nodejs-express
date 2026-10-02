import { Router } from 'express';
import { principal, listar, obtener, crear } from '../controllers/peleadores.controller.js';

const router = Router();

router.get('/', principal);
router.get('/peleadores', listar);
router.get('/peleadores/:id', obtener);
router.post('/peleadores', crear);

export default router;
