import { Router } from 'express';
import { list, showConfig } from '../controllers/studios.controller.js';

const router = Router();

router.get('/', list);
router.get('/config', showConfig);

export default router;
