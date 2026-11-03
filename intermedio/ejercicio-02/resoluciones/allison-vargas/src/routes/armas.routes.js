import { Router } from 'express';
import * as controller from '../controllers/armas.controller.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.param('id', validarId);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

export default router;
