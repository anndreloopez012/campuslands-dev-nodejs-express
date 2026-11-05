import { Router } from 'express';
import { strongest, dps } from '../controllers/weapons.controller.js';

const router = Router();

router.get('/strongest', strongest);
router.get('/:id/dps', dps);

export default router;
