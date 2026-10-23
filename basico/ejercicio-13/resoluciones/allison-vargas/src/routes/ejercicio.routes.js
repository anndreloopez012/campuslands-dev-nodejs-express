import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerNaves,
  obtenerNavePorId,
  forzarErrorInesperado,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-13
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-13/naves
router.get('/naves', obtenerNaves);

// GET /basico/ejercicio-13/naves/:id
router.get('/naves/:id', obtenerNavePorId);

// GET /basico/ejercicio-13/forzar-error (solo para probar el middleware)
router.get('/forzar-error', forzarErrorInesperado);

export default router;
