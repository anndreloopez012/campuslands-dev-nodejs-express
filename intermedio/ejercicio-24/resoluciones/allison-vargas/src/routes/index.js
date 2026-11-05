import { Router } from 'express';
import formulasRoutes from './formulas.routes.js';
import compuestosRoutes from './compuestos.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'testing de servicios',
  });
});

router.use('/formulas', formulasRoutes);
router.use('/compuestos', compuestosRoutes);

export default router;
