import { Router } from 'express';
import { ejecutarEjercicio, obtenerEquipos } from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-05
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-05/equipos
router.get('/equipos', obtenerEquipos);

export default router;
