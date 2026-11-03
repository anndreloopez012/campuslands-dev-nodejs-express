import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-01.js';

const router = Router();
router.use('/ejercicio-01', exerciseRouter);

export default router;
