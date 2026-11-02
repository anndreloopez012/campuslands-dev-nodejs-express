import { Router } from 'express';
import { list, getOne, create } from '../controllers/workorders.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', authenticate, authorize("admin"), create);

export default router;
