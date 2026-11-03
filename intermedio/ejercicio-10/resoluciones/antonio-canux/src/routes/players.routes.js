import { Router } from 'express';
import { list } from '../controllers/players.controller.js';

const router = Router();

router.get('/', list);

export default router;
