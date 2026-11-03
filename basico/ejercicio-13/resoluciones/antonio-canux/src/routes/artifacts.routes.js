import { Router } from 'express';
import { getStatus, getArtifacts, getArtifactById, createArtifact } from '../controllers/artifacts.controller.js';

const router = Router();
router.get('/', getStatus);
router.get('/artifacts', getArtifacts);
router.get('/artifacts/:id', getArtifactById);
router.post('/artifacts', createArtifact);

export default router;
