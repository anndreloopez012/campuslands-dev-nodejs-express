import { Router } from 'express';
import { getHealth, listAll, getOne, createOne, updateOne, deleteOne } from '../controllers/workshop.controller.js';
import { validateBike } from '../middlewares/validator.middleware.js';

const router = Router();
router.get('/basico/ejercicio-30', getHealth);
router.get('/api/workshop/bikes', listAll);
router.get('/api/workshop/bikes/:id', getOne);
router.post('/api/workshop/bikes', validateBike, createOne);
router.put('/api/workshop/bikes/:id', updateOne);
router.delete('/api/workshop/bikes/:id', deleteOne);

export default router;
