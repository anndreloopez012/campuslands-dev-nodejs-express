import { Router } from 'express';
import { getHealth, getStatus } from '../controllers/matchmaking.controller.js';

const router = Router();
router.get('/basico/ejercicio-28', getHealth);
router.get('/api/br/server-status', getStatus);

export default router;
