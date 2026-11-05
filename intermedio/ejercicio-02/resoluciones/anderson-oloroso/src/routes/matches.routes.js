import { Router } from 'express';
import { listMatches, registerMatch } from '../controllers/matches.controller.js';

const router = Router();

router.get('/', listMatches);
router.post('/', registerMatch);

export default router;
