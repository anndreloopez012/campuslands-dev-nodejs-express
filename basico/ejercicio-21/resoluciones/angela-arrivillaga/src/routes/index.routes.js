import { Router } from 'express';
import animacionesRoutes from './animaciones.routes.js';
import { principal } from '../controllers/principal.controller.js';

const router = Router();

router.get('/', principal);
router.use('/animaciones', animacionesRoutes);

export default router;
