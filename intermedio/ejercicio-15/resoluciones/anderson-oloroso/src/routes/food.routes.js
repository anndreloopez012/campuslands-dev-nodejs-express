import { Router } from 'express';
import { getHealth, login, getProfile } from '../controllers/food.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-15', getHealth);
router.post('/api/streetfood/auth/login', login);
router.get('/api/streetfood/profile', getProfile);

export default router;
