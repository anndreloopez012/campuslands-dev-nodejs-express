import { Router } from 'express';
import { getHealth, calculateMolar } from '../controllers/chemistry.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-24', getHealth);
router.post('/api/chemistry/molar-mass', calculateMolar);

export default router;
