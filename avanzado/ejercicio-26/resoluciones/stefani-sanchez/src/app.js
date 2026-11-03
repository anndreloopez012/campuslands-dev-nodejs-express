import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-26.js';

const router = Router();
router.use('/ejercicio-26', exerciseRouter);

export default router;
