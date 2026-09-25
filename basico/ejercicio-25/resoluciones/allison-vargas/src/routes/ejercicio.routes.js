import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerPersonajes,
  obtenerPersonajePorId,
  crearNuevoPersonaje,
  actualizarPersonajeExistente,
  eliminarPersonajeExistente,
  equiparArma,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-25
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-25/personajes
router.get('/personajes', obtenerPersonajes);

// GET /basico/ejercicio-25/personajes/:id
router.get('/personajes/:id', obtenerPersonajePorId);

// POST /basico/ejercicio-25/personajes
router.post('/personajes', crearNuevoPersonaje);

// PUT /basico/ejercicio-25/personajes/:id
router.put('/personajes/:id', actualizarPersonajeExistente);

// DELETE /basico/ejercicio-25/personajes/:id
router.delete('/personajes/:id', eliminarPersonajeExistente);

// POST /basico/ejercicio-25/personajes/:id/equipar
router.post('/personajes/:id/equipar', equiparArma);

export default router;
