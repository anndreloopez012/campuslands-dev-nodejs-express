import { Router } from 'express';
import { ejecutarEjercicio, obtenerArmas } from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-02
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-02/armas
router.get('/armas', obtenerArmas);

export default router;
