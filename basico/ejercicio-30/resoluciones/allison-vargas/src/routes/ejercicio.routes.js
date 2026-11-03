import { Router } from 'express';
import { ejecutarEjercicio } from '../controllers/ejercicio.controller.js';
import motosRoutes from './motos.routes.js';
import ordenesRoutes from './ordenes.routes.js';

const router = Router();

router.get('/', ejecutarEjercicio);
router.use('/motos', motosRoutes);
router.use('/ordenes', ordenesRoutes);

export default router;
