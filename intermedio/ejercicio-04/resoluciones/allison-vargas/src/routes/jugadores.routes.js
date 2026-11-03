import { Router } from 'express';
import * as controller from '../controllers/jugadores.controller.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.param('id', validarId);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.get('/:id/estadisticas', controller.estadisticas);

export default router;
