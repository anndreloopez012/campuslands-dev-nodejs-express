import { Router } from 'express';
import {
  getHealth,
  getTeams,
  getChampions,
  postDraftAnalysis
} from '../controllers/moba.controller.js';

const router = Router();

// Endpoint de verificación del README base
router.get('/intermedio/ejercicio-03', getHealth);

// Endpoints MOBA Esports
router.get('/api/moba/teams', getTeams);
router.get('/api/moba/champions', getChampions);
router.post('/api/moba/drafts', postDraftAnalysis);

export default router;
