import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-10.js';

const router = Router();
router.use('/ejercicio-10', exerciseRouter);

export default router;
