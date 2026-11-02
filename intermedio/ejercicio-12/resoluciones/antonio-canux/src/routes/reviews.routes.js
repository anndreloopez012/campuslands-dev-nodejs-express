import { Router } from 'express';
import { listReviews, createReview } from '../controllers/reviews.controller.js';

// mergeParams permite leer :movieId definido en el router padre
const router = Router({ mergeParams: true });

router.get('/', listReviews);
router.post('/', createReview);

export default router;
