import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-08.js';

const router = Router();
router.use('/ejercicio-08', exerciseRouter);

export default router;
