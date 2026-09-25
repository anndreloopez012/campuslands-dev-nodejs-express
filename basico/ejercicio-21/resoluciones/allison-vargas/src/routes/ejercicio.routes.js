// routes SOLO mapea metodo HTTP + url a un
// controlador. No valida, no toca datos, no decide status codes.

import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerProyectos,
  obtenerProyectoPorId,
  crearNuevoProyecto,
  actualizarProyectoExistente,
  eliminarProyectoExistente,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-21
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-21/proyectos
router.get('/proyectos', obtenerProyectos);

// GET /basico/ejercicio-21/proyectos/:id
router.get('/proyectos/:id', obtenerProyectoPorId);

// POST /basico/ejercicio-21/proyectos
router.post('/proyectos', crearNuevoProyecto);

// PUT /basico/ejercicio-21/proyectos/:id
router.put('/proyectos/:id', actualizarProyectoExistente);

// DELETE /basico/ejercicio-21/proyectos/:id
router.delete('/proyectos/:id', eliminarProyectoExistente);

export default router;
