import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-22.js';

const router = Router();
router.use('/ejercicio-22', exerciseRouter);

export default router;
