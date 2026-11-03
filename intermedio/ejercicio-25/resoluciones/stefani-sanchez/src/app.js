import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-25.js';

const router = Router();
router.use('/ejercicio-25', exerciseRouter);

export default router;
