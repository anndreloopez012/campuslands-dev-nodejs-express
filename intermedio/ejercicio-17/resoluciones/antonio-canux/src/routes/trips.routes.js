import { Router } from 'express';
import { list, create, remove } from '../controllers/trips.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, list);
router.post('/', authenticate, authorize("admin"), create);
router.delete('/:id', authenticate, authorize("admin"), remove);

export default router;
