import { Router } from 'express';
import { principal, obtener, parsear, fallar } from '../controllers/naves.controller.js';

const router = Router();

router.get('/', principal);
router.get('/fallar', fallar);
router.get('/parsear', parsear);
router.get('/naves/:id', obtener);

export default router;
