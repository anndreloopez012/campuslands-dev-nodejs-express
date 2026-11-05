import { Router } from 'express';
import { mass } from '../controllers/formulas.controller.js';

const router = Router();

router.get('/:formula/mass', mass);

export default router;
