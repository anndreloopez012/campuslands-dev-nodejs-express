import { Router } from 'express';
import { getHealth, listTournaments, addTournament } from '../controllers/moba.controller.js';

const router = Router();
router.get('/basico/ejercicio-27', getHealth);
router.get('/api/moba/tournaments', listTournaments);
router.post('/api/moba/tournaments', addTournament);

export default router;
