import { Router } from 'express';
import { ejecutarEjercicio, obtenerProductos } from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-16
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-16/productos
router.get('/productos', obtenerProductos);

export default router;
