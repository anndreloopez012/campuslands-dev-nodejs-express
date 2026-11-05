import { Router } from 'express';
import { getHealth, getDrops, getVault } from '../controllers/sneakers.controller.js';
import { requireVipAccess } from '../middlewares/guard.middleware.js';

const router = Router();
router.get('/intermedio/ejercicio-16', getHealth);
router.get('/api/sneakers/drops', getDrops); // Ruta pública
router.get('/api/sneakers/vault', requireVipAccess, getVault); // Ruta protegida con guardián

export default router;
