import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-05.js';

const router = Router();
router.use('/ejercicio-05', exerciseRouter);

export default router;
