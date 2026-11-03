import { Router } from 'express';
import jugadoresRoutes from './jugadores.routes.js';
import armasRoutes from './armas.routes.js';
import partidasRoutes from './partidas.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'routers modulares',
  });
});

router.use('/jugadores', jugadoresRoutes);
router.use('/armas', armasRoutes);
router.use('/partidas', partidasRoutes);

export default router;
