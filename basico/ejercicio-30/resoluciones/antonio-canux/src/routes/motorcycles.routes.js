import { Router } from 'express';
import {
  getStatus,
  getMotorcycles,
  getMotorcycleById,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle
} from '../controllers/motorcycles.controller.js';

const router = Router();
router.get('/', getStatus);
router.get('/motorcycles', getMotorcycles);
router.get('/motorcycles/:id', getMotorcycleById);
router.post('/motorcycles', createMotorcycle);
router.put('/motorcycles/:id', updateMotorcycle);
router.delete('/motorcycles/:id', deleteMotorcycle);

export default router;
