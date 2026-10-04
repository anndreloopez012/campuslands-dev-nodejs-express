import { Router } from 'express';

import {
  getHealth,
  createPlayer
} from '../controllers/game.controller.js';

const router = Router();

router.get('/health', getHealth);

router.post('/players', createPlayer);

export default router;