import { Router } from 'express';
import { principal, listar, obtener, verLogs } from '../controllers/campeones.controller.js';

const router = Router();

router.get('/', principal);
router.get('/campeones', listar);
router.get('/campeones/:id', obtener);
router.get('/logs', verLogs);

export default router;
