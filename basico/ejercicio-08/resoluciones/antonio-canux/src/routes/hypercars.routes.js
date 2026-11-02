import { Router } from 'express';
import { getStatus, getHypercars } from '../controllers/hypercars.controller.js';

const router = Router();

router.get('/ejercicio-08', getStatus);
router.get('/ejercicio-08/hypercars', getHypercars);

export default router;