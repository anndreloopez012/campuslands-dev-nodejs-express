import { Router } from 'express';
import jugadoresRoutes from './jugadores.routes.js';
import partidasRoutes from './partidas.routes.js';
import rankingRoutes from './ranking.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'servicios reutilizables',
  });
});

router.use('/jugadores', jugadoresRoutes);
router.use('/partidas', partidasRoutes);
router.use('/ranking', rankingRoutes);

export default router;
