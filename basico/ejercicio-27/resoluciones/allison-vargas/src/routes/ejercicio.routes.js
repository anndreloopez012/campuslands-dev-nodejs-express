import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerPartidas,
  crearNuevaPartida,
  obtenerLogsRecientes,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-27
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-27/partidas
router.get('/partidas', obtenerPartidas);

// POST /basico/ejercicio-27/partidas
router.post('/partidas', crearNuevaPartida);

// GET /basico/ejercicio-27/logs/recientes?cantidad=
router.get('/logs/recientes', obtenerLogsRecientes);

export default router;
