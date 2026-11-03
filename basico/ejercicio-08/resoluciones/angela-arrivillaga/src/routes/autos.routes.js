import { Router } from 'express';
import { principal, verConfig, obtener } from '../controllers/autos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/config', verConfig);
router.get('/autos/:id', obtener);

export default router;
