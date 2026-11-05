import { Router } from 'express';
import { getHealth, listFighters } from '../controllers/fighters.controller.js';

const router = Router();

// Endpoint de verificación del README base
router.get('/intermedio/ejercicio-09', getHealth);

// Endpoints Kickboxing
router.get('/api/kickboxing/fighters', listFighters);

export default router;
