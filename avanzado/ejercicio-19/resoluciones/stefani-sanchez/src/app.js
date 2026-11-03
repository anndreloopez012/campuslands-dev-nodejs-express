import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-19.js';

const router = Router();
router.use('/ejercicio-19', exerciseRouter);

export default router;
