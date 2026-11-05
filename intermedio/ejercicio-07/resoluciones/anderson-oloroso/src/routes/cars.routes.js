import { Router } from 'express';
import {
  getHealth,
  listCars,
  getCar,
  postTestDrive
} from '../controllers/cars.controller.js';

const router = Router();

// Endpoint de verificación del README base
router.get('/intermedio/ejercicio-07', getHealth);

// Endpoints Autos de Lujo
router.get('/api/luxury-cars', listCars);
router.get('/api/luxury-cars/:id', getCar);
router.post('/api/luxury-cars/test-drive', postTestDrive);

export default router;
