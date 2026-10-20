import { Router } from 'express';
import { getAllHeroes, getHeroById, createHero } from '../controllers/hero.controller.js';

const router = Router();

router.get('/', getAllHeroes);
router.get('/:id', getHeroById);
router.post('/', createHero);

export default router;