import { Router } from 'express';
import { list, getOne, create } from '../controllers/champions.controller.js';

const router = Router();

router.get('/', list);
router.get('/:id', getOne);
router.post('/', create);

export default router;
