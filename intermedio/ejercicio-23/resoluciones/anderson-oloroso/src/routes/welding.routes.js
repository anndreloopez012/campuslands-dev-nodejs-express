import { Router } from 'express';
import { getHealth, calculateHeat } from '../controllers/welding.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-23', getHealth);
router.post('/api/welding/heat-input', calculateHeat);

export default router;
