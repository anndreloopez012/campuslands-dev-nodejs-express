import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-03.js';

const router = Router();
router.use('/ejercicio-03', exerciseRouter);

export default router;
