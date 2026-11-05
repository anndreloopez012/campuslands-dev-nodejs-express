import { Router } from 'express';
import {
  getHealth,
  getPhases,
  postCalculateSurvival,
  postAirdrop
} from '../controllers/battleroyale.controller.js';

const router = Router();

// Endpoint de verificación
router.get('/intermedio/ejercicio-04', getHealth);

// Endpoints Battle Royale
router.get('/api/br/storm-phases', getPhases);
router.post('/api/br/calculate-damage', postCalculateSurvival);
router.post('/api/br/airdrop', postAirdrop);

export default router;
