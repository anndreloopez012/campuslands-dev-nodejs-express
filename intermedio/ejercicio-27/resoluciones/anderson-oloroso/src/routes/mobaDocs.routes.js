import { Router } from 'express';
import {
  getHealth,
  getOpenApiDocs,
  listTournaments,
  createTournament
} from '../controllers/mobaDocs.controller.js';

const router = Router();

router.get('/intermedio/ejercicio-27', getHealth);
router.get('/api/docs', getOpenApiDocs);
router.get('/api/moba/tournaments', listTournaments);
router.post('/api/moba/tournaments', createTournament);

export default router;
