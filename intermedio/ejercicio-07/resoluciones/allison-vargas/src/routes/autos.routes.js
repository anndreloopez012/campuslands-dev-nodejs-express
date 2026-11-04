import { Router } from 'express';
import * as controller from '../controllers/autos.controller.js';
import { apiKey } from '../middlewares/apiKey.js';

const router = Router();

router.get('/', controller.listar);
router.post('/', apiKey, controller.crear);
router.get('/:id', controller.obtener);
router.post('/:id/reservar', controller.reservar);

export default router;
