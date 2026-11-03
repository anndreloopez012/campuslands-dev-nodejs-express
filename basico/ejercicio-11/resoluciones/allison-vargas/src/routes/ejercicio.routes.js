import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerCanciones,
  obtenerCancionPorTitulo,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-11
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-11/canciones
router.get('/canciones', obtenerCanciones);

// GET /basico/ejercicio-11/canciones/:titulo
router.get('/canciones/:titulo', obtenerCancionPorTitulo);

export default router;
