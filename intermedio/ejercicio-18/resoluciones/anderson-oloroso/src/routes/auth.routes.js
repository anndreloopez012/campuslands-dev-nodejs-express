import { Router } from 'express';
import { getHealth, register, login } from '../controllers/auth.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-18', getHealth);
router.post('/api/skydive/register', register);
router.post('/api/skydive/login', login);

export default router;
