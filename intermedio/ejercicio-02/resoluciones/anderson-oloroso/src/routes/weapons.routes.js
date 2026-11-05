import { Router } from 'express';
import { listWeapons } from '../controllers/weapons.controller.js';

const router = Router();

router.get('/', listWeapons);

export default router;
