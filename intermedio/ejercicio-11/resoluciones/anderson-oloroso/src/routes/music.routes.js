import { Router } from 'express';
import { getHealth, getTracks } from '../controllers/music.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-11', getHealth);
router.get('/api/music/tracks', getTracks);

export default router;
