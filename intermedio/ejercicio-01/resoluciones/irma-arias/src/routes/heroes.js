import { Router } from 'express';
import { createHero, listHeroes } from '../controllers/heroesController.js';

const router = Router();
router.get('/', listHeroes);
router.post('/', createHero);

export default router;
