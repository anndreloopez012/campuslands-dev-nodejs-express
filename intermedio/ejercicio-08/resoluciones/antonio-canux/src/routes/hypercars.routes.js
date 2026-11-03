import { Router } from 'express';
import { list, getOne } from '../controllers/hypercars.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);

export default router;
