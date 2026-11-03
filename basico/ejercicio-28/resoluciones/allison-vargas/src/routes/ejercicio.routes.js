import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerConfigActiva,
  obtenerPartidas,
  crearNuevaPartida,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-28
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-28/config
router.get('/config', obtenerConfigActiva);

// GET /basico/ejercicio-28/partidas
router.get('/partidas', obtenerPartidas);

// POST /basico/ejercicio-28/partidas
router.post('/partidas', crearNuevaPartida);

export default router;
