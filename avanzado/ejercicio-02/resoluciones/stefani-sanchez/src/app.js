import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-02.js';

const router = Router();
router.use('/ejercicio-02', exerciseRouter);

export default router;
