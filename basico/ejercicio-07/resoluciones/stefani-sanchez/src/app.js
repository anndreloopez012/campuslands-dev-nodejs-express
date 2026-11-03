import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-07.js';

const router = Router();
router.use('/ejercicio-07', exerciseRouter);

export default router;
