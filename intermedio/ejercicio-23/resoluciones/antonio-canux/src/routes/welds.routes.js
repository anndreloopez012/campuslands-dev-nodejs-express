import { Router } from 'express';
import { list, amperage } from '../controllers/welds.controller.js';

const router = Router();

router.get('/', list);
router.get('/amperage', amperage);

export default router;
