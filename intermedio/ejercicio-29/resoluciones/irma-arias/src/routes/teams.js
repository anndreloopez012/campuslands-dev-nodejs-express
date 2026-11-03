import { Router } from 'express';
import { createTeam, listTeams } from '../controllers/teamsController.js';

const router = Router();
router.get('/', listTeams);
router.post('/', createTeam);
export default router;
