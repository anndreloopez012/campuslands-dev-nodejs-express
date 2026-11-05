import { Router } from 'express';
import { getHealth, listStandings, createTeam } from '../controllers/league.controller.js';

const router = Router();
router.get('/basico/ejercicio-29', getHealth);
router.get('/api/football/standings', listStandings);
router.post('/api/football/standings', createTeam);

export default router;
