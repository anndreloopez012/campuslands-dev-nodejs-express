import { Router } from 'express';
import { ejecutarEjercicio, obtenerAutos } from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-08
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-08/autos
router.get('/autos', obtenerAutos);

export default router;
