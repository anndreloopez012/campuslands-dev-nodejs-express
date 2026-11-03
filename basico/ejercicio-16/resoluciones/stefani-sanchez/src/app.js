import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-16.js';

const router = Router();
router.use('/ejercicio-16', exerciseRouter);

export default router;
