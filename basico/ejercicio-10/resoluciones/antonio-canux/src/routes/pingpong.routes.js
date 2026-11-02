import { Router } from 'express';
import { getStatus, playPingPongMatch } from '../controllers/pingpong.controller.js';

const router = Router();

router.get('/ejercicio-010', getStatus);
router.post('/ejercicio-010/match', playPingPongMatch);

export default router;