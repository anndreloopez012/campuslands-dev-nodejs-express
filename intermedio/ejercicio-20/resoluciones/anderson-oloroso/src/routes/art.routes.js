import { Router } from 'express';
import { getHealth, getArtworks } from '../controllers/art.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-20', getHealth);
router.get('/api/digital-art/galleries', getArtworks);

export default router;
