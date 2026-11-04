import { Router } from 'express';
import * as controller from '../controllers/jugadores.controller.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.get('/:id/partidos', controller.listarPartidos);

export default router;
