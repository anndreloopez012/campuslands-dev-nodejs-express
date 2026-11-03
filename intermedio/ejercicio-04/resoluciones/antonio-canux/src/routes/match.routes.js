import { Router } from 'express';
import { recordMatch } from '../controllers/match.controller.js';

const router = Router();

router.post('/', recordMatch);

export default router;