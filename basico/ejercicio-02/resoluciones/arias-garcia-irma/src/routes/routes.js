
import { Router } from 'express';
import { getHealth, listPlayers, registerPlayer } from '../controllers/player.controller.js';

const router = Router();

router.get('/health', getHealth);
router.get('/players', listPlayers);
router.post('/players', registerPlayer);

export default router;