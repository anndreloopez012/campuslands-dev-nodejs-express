import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerPeleadores,
  crearNuevoPeleador,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-09
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-09/peleadores
router.get('/peleadores', obtenerPeleadores);

// POST /basico/ejercicio-09/peleadores
router.post('/peleadores', crearNuevoPeleador);

export default router;
