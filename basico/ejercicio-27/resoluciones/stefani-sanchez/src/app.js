import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-27.js';

const router = Router();
router.use('/ejercicio-27', exerciseRouter);

export default router;
