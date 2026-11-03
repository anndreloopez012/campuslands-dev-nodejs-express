import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerDibujos,
  crearNuevoDibujo,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-20
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-20/dibujos
router.get('/dibujos', obtenerDibujos);

// POST /basico/ejercicio-20/dibujos (con express.json() aplicado)
router.post('/dibujos', crearNuevoDibujo);

export default router;
