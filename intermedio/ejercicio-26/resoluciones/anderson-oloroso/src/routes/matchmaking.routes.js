import { Router } from 'express';
import { getHealth, postJoinQueue } from '../controllers/matchmaking.controller.js';

const router = Router();

router.get('/intermedio/ejercicio-26', getHealth);
router.post('/api/shooters/matchmaking/queue', postJoinQueue);

export default router;
