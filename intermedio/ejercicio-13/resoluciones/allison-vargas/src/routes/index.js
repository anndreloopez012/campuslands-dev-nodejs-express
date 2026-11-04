import { Router } from 'express';
import navesRoutes from './naves.routes.js';
import tripulantesRoutes from './tripulantes.routes.js';
import misionesRoutes from './misiones.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'relaciones simples',
  });
});

router.use('/naves', navesRoutes);
router.use('/tripulantes', tripulantesRoutes);
router.use('/misiones', misionesRoutes);

export default router;
