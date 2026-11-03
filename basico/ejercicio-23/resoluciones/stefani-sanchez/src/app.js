import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-23.js';

const router = Router();
router.use('/ejercicio-23', exerciseRouter);

export default router;
