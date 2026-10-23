import { Router } from 'express';
import { principal, listar, obtener, crear, actualizar, eliminar } from '../controllers/formulas.controller.js';

const router = Router();

router.get('/', principal);
router.get('/formulas', listar);
router.get('/formulas/:id', obtener);
router.post('/formulas', crear);
router.put('/formulas/:id', actualizar);
router.delete('/formulas/:id', eliminar);

export default router;
