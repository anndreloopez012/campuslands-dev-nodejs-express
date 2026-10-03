import { Router } from 'express';
import { getStatus, listFighters, createFighter } from '../controllers/fighters.controller.js';

const router = Router();

router.get('/ejercicio-09', getStatus);
router.get('/ejercicio-09/fighters', listFighters);
router.post('/ejercicio-09/fighters', createFighter);

export default router;