import { Router } from 'express';
import { listWeapons, getWeaponById } from '../controllers/weapons.controller.js';

const router = Router();

router.get('/', listWeapons);
router.get('/:id', getWeaponById);

export default router;
