import { Router } from 'express';
import { getHealth, getMovieReviews, postMovieReview } from '../controllers/horror.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-12', getHealth);
// Subrecursos REST: críticas pertenecientes a una película
router.get('/api/movies/:id/reviews', getMovieReviews);
router.post('/api/movies/:id/reviews', postMovieReview);

export default router;
