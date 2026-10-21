import { Router } from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  deleteTeam
} from '../controllers/team.controller.js';

const router = Router();

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.delete('/:id', deleteTeam);

export default router;