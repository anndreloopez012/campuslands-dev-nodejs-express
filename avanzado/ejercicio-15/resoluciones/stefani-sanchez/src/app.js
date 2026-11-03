import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-15.js';

const router = Router();
router.use('/ejercicio-15', exerciseRouter);

export default router;
