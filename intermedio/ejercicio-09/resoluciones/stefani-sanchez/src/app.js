import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-09.js';

const router = Router();
router.use('/ejercicio-09', exerciseRouter);

export default router;
