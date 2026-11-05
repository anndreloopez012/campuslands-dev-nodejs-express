import { Router } from 'express';
import {
  getHealth,
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/team.controller.js';

const router = Router();

// Endpoint de verificación
router.get('/intermedio/ejercicio-05', getHealth);

// Endpoints CRUD Fútbol y Futsal
router.get('/api/football/teams', getAllTeams);
router.get('/api/football/teams/:id', getTeamById);
router.post('/api/football/teams', createTeam);
router.put('/api/football/teams/:id', updateTeam);
router.delete('/api/football/teams/:id', deleteTeam);

export default router;
