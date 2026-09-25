import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerPeliculas,
  verPelicula,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-12
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-12/peliculas
router.get('/peliculas', obtenerPeliculas);

// GET /basico/ejercicio-12/peliculas/:id/ver?edad=
router.get('/peliculas/:id/ver', verPelicula);

export default router;
