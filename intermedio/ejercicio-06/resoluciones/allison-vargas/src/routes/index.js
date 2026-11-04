import { Router } from 'express';
import motosRoutes from './motos.routes.js';
import ordenesRoutes from './ordenes.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'validacion centralizada',
  });
});

router.use('/motos', motosRoutes);
router.use('/ordenes', ordenesRoutes);

export default router;
