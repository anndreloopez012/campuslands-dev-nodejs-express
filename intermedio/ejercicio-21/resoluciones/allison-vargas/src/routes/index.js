import { Router } from 'express';
import escenasRoutes from './escenas.routes.js';
import limitesRoutes from './limites.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rate limit conceptual',
  });
});

router.use('/limites', limitesRoutes);
router.use('/escenas', escenasRoutes);

export default router;
