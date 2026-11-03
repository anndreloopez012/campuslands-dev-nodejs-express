import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-06.js';

const router = Router();
router.use('/ejercicio-06', exerciseRouter);

export default router;
