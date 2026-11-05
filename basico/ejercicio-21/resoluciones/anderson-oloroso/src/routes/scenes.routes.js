import { Router } from 'express';
import { getHealth, listScenes, getScene } from '../controllers/scenes.controller.js';

const router = Router();

router.get('/basico/ejercicio-21', getHealth);
router.get('/api/animation/scenes', listScenes);
router.get('/api/animation/scenes/:id', getScene);

export default router;
