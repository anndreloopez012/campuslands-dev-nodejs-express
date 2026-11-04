import { Router } from 'express';
import peleadoresRoutes from './peleadores.routes.js';
import combatesRoutes from './combates.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'paginacion y filtros',
  });
});

router.use('/peleadores', peleadoresRoutes);
router.use('/combates', combatesRoutes);

export default router;
