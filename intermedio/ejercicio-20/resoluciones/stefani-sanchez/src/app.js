import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-20.js';

const router = Router();
router.use('/ejercicio-20', exerciseRouter);

export default router;
