import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-24.js';

const router = Router();
router.use('/ejercicio-24', exerciseRouter);

export default router;
