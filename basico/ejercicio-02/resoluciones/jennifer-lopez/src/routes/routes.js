import { Router } from 'express';
import { getStats } from '../controllers/controller.js';

const router = Router();

router.get('/stats', getStats);

export default router;