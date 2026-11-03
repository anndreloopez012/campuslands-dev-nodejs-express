import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-30.js';

const router = Router();
router.use('/ejercicio-30', exerciseRouter);

export default router;
