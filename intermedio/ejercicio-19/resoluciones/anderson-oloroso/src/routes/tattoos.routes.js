import { Router } from 'express';
import { getHealth, getStudioInfo } from '../controllers/tattoos.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-19', getHealth);
router.get('/api/tattoos/studio-info', getStudioInfo);

export default router;
