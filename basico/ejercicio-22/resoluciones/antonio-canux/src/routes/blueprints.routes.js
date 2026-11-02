import { Router } from 'express';
import { getStatus, getBlueprints, getBlueprintById, createBlueprint } from '../controllers/blueprints.controller.js';

const router = Router();
router.get('/', getStatus);
router.get('/blueprints', getBlueprints);
router.get('/blueprints/:id', getBlueprintById);
router.post('/blueprints', createBlueprint);

export default router;
