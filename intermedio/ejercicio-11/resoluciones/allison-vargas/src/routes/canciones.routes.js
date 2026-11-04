import { Router } from 'express';
import * as controller from '../controllers/canciones.controller.js';

const router = Router();

router.get('/', controller.listar);
router.get('/sugerencias', controller.sugerencias);
router.get('/:id', controller.obtener);

export default router;
