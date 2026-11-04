import { Router } from 'express';
import * as controller from '../controllers/peleadores.controller.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.get('/:id/combates', controller.listarCombates);

export default router;
