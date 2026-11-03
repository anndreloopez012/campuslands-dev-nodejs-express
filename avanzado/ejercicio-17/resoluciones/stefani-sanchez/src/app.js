import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-17.js';

const router = Router();
router.use('/ejercicio-17', exerciseRouter);

export default router;
