import { Router } from 'express';
import { principal, listar, obtener } from '../controllers/sneakers.controller.js';

const router = Router();

router.get('/', principal);
router.get('/sneakers', listar);
router.get('/sneakers/:id', obtener);

export default router;
