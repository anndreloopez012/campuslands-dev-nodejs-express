import { Router } from 'express';
import { list, create } from '../controllers/sneakers.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', list);
router.post('/', authenticate, create);

export default router;
