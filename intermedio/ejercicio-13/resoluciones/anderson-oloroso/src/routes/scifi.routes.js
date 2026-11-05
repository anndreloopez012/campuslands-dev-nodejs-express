import { Router } from 'express';
import { getHealth, listShips, getShipCrew, addCrew } from '../controllers/scifi.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-13', getHealth);
router.get('/api/scifi/ships', listShips);
router.get('/api/scifi/ships/:id/crew', getShipCrew);
router.post('/api/scifi/ships/:id/crew', addCrew);

export default router;
