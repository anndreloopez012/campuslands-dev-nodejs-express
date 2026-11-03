import { Router } from 'express';
import { listCars, getCarById, createCar, crash } from '../controllers/car.controller.js';

const router = Router();

router.get('/', listCars);
router.get('/crash', crash);
router.get('/:id', getCarById);
router.post('/', createCar);

export default router;
