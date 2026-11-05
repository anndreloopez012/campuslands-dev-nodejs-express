import { Router } from 'express';
import { list } from '../controllers/animations.controller.js';
import { rateLimit } from '../middlewares/rate-limit.middleware.js';

const router = Router();
router.use(rateLimit({ max: 5, windowMs: 10000 }));

router.get('/', list);

export default router;
