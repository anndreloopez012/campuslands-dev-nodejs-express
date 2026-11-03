import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-29.js';

const router = Router();
router.use('/ejercicio-29', exerciseRouter);

export default router;
