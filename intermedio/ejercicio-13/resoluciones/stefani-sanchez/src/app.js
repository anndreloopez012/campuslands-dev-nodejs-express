import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-13.js';

const router = Router();
router.use('/ejercicio-13', exerciseRouter);

export default router;
