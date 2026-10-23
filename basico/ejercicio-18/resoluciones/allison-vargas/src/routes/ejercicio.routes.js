import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerSaltos,
  crearSalto,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-18
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-18/saltos
router.get('/saltos', obtenerSaltos);

// POST /basico/ejercicio-18/saltos
router.post('/saltos', crearSalto);

export default router;
