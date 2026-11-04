import { Router } from 'express';
import { login, me, logout } from '../controllers/auth.controller.js';
import { requireSession } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireSession, me);
router.post('/logout', requireSession, logout);

export default router;
