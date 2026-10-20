import { Router } from 'express';
import { getPlayerProfile } from '../controllers/player.controller.js';

const router = Router();

router.get('/:id', getPlayerProfile);

export default router;