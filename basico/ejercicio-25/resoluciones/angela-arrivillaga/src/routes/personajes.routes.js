import { Router } from 'express';
import { principal, listar, obtener, crear } from '../controllers/personajes.controller.js';

const router = Router();

router.get('/', principal);
router.get('/personajes', listar);
router.get('/personajes/:id', obtener);
router.post('/personajes', crear);

export default router;
