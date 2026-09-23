import { Router } from 'express';
import { getMatch } from '../controllers/match.controller.js';

const router = Router();

router.get('/match', getMatch);

export default router;