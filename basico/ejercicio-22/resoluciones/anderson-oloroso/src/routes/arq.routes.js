import { Router } from 'express';
import { getHealth, getMateriales, postPresupuesto } from '../controllers/arq.controller.js';

const router = Router();
router.get('/basico/ejercicio-22', getHealth);
router.get('/api/arq3d/materials', getMateriales);
router.post('/api/arq3d/budget', postPresupuesto);

export default router;
