import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-14.js';

const router = Router();
router.use('/ejercicio-14', exerciseRouter);

export default router;
