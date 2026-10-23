import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerSoldaduras,
  obtenerSoldaduraPorId,
  crearNuevaSoldadura,
  actualizarSoldaduraExistente,
  eliminarSoldaduraExistente,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-23
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-23/soldaduras
router.get('/soldaduras', obtenerSoldaduras);

// GET /basico/ejercicio-23/soldaduras/:id
router.get('/soldaduras/:id', obtenerSoldaduraPorId);

// POST /basico/ejercicio-23/soldaduras
router.post('/soldaduras', crearNuevaSoldadura);

// PUT /basico/ejercicio-23/soldaduras/:id
router.put('/soldaduras/:id', actualizarSoldaduraExistente);

// DELETE /basico/ejercicio-23/soldaduras/:id
router.delete('/soldaduras/:id', eliminarSoldaduraExistente);

export default router;
