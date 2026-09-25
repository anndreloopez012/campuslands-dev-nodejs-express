import { Router } from 'express';

import {
  healthController,
  welcomeController,
} from '../controllers/welcome.controller.js';

const router = Router();

router.get('/', welcomeController);
router.get('/health', healthController);

export default router;