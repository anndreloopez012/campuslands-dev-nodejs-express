import { Router } from 'express';
import * as controller from '../controllers/hiperdeportivos.controller.js';

const router = Router();

router.get('/', controller.listar);
router.post('/', controller.crear);
router.get('/:id', controller.obtener);
router.get('/:id/vueltas', controller.listarVueltas);
router.post('/:id/vueltas', controller.registrarVuelta);

export default router;
