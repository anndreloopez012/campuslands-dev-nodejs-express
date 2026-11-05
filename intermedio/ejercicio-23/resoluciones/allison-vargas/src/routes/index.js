import { Router } from 'express';
import calculosRoutes from './calculos.routes.js';
import procedimientosRoutes from './procedimientos.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'testing con node test',
  });
});

router.use('/calculos', calculosRoutes);
router.use('/procedimientos', procedimientosRoutes);

export default router;
