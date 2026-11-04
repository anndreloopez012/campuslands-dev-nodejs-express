import { Router } from 'express';
import { disparar } from '../controllers/errores.controller.js';

const router = Router();

router.get('/:tipo', disparar);

export default router;
