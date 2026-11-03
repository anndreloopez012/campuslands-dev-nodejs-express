import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-04.js';

const router = Router();
router.use('/ejercicio-04', exerciseRouter);

export default router;
