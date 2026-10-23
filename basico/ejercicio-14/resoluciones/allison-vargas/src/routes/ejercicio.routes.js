import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerLibros,
  crearNuevoLibro,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-14
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-14/libros
router.get('/libros', obtenerLibros);

// POST /basico/ejercicio-14/libros
router.post('/libros', crearNuevoLibro);

export default router;
