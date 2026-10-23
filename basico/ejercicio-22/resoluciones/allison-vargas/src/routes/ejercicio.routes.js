import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerModelos,
  obtenerModeloPorId,
  crearNuevoModelo,
  obtenerResumenModelos,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-22
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-22/modelos
router.get('/modelos', obtenerModelos);

// GET /basico/ejercicio-22/modelos/resumen (ruta estatica, antes de /:id)
router.get('/modelos/resumen', obtenerResumenModelos);

// GET /basico/ejercicio-22/modelos/:id
router.get('/modelos/:id', obtenerModeloPorId);

// POST /basico/ejercicio-22/modelos
router.post('/modelos', crearNuevoModelo);

export default router;
