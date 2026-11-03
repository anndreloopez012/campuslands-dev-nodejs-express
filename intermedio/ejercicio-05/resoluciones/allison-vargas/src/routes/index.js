import { Router } from 'express';
import equiposRoutes from './equipos.routes.js';
import jugadoresRoutes from './jugadores.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'repositorios en memoria',
  });
});

router.use('/equipos', equiposRoutes);
router.use('/jugadores', jugadoresRoutes);

export default router;
