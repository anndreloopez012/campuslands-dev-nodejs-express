import { Router } from 'express';
import { getHealth, requestRender } from '../controllers/render.controller.js';
import { rateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();
router.get('/intermedio/ejercicio-21', getHealth);
// Aplica límite de 5 peticiones por minuto por cliente
router.post('/api/render-farm/render-jobs', rateLimiter({ windowMs: 60000, max: 5 }), requestRender);

export default router;
