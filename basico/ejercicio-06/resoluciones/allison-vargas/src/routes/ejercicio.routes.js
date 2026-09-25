import { Router } from 'express';
import { ejecutarEjercicio, obtenerFicha } from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-06
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-06/fichas/:modelo
router.get('/fichas/:modelo', obtenerFicha);

export default router;
