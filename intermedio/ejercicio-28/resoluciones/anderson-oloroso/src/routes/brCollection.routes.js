import { Router } from 'express';
import {
  getHealth,
  listLootZones,
  getLootZoneById,
  createLoadout
} from '../controllers/brCollection.controller.js';

const router = Router();

router.get('/intermedio/ejercicio-28', getHealth);
router.get('/api/br/loot-zones', listLootZones);
router.get('/api/br/loot-zones/:id', getLootZoneById);
router.post('/api/br/loadout', createLoadout);

export default router;
