import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-11.js';

const router = Router();
router.use('/ejercicio-11', exerciseRouter);

export default router;
