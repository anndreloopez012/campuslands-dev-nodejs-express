import { Router } from 'express';
import exerciseRouter from './routes/ejercicio-21.js';

const router = Router();
router.use('/ejercicio-21', exerciseRouter);

export default router;
