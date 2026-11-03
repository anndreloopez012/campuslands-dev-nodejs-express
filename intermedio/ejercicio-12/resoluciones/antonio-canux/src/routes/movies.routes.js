import { Router } from 'express';
import { list, getOne } from '../controllers/movies.controller.js';
import reviewsRoutes from './reviews.routes.js';

const router = Router();

router.use('/:movieId/reviews', reviewsRoutes);

router.get('/', list);
router.get('/:id', getOne);

export default router;
