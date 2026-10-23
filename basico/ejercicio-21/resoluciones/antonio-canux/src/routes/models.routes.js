import { Router } from 'express';
import { getStatus, getModels, getModelById, createModel } from '../controllers/models.controller.js';

const router = Router();
router.get('/', getStatus);
router.get('/models', getModels);
router.get('/models/:id', getModelById);
router.post('/models', createModel);

export default router;
