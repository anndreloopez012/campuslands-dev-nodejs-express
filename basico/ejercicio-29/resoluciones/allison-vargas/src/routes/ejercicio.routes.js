import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerPartidos,
  obtenerPartidoPorId,
  crearNuevoPartido,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-29
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-29/partidos
router.get('/partidos', obtenerPartidos);

// GET /basico/ejercicio-29/partidos/:id
router.get('/partidos/:id', obtenerPartidoPorId);

// POST /basico/ejercicio-29/partidos
router.post('/partidos', crearNuevoPartido);

export default router;
