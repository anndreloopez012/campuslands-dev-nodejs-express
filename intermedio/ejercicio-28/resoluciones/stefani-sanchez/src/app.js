import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-28.js';

const router = Router();
router.use('/ejercicio-28', exerciseRouter);

export default router;
