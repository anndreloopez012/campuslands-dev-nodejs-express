import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-12.js';

const router = Router();
router.use('/ejercicio-12', exerciseRouter);

export default router;
