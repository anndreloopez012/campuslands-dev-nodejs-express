import { Router } from 'express';
import { getStatus, listCarsAPI } from '../controllers/cars.controller.js';

const router = Router();

// Ruta obligatoria del ejercicio
router.get('/ejercicio-07', getStatus);

// Ruta adicional temática
router.get('/ejercicio-07/autos', listCarsAPI);

export default router;