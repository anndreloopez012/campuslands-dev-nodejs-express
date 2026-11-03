import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-18.js';

const router = Router();
router.use('/ejercicio-18', exerciseRouter);

export default router;
