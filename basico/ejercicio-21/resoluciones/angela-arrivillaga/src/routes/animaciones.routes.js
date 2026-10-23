import { Router } from 'express';
import { listar, obtener } from '../controllers/animaciones.controller.js';

const router = Router();

router.get('/', listar);
router.get('/:id', obtener);

export default router;
