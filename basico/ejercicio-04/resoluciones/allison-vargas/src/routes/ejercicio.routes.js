import { Router } from 'express';
import { ejecutarEjercicio, obtenerJugadores } from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-04
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-04/jugadores
router.get('/jugadores', obtenerJugadores);

export default router;
