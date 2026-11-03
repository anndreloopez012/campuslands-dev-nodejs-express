import { Router } from 'express';
import equiposRoutes from './equipos.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'controladores limpios',
  });
});

router.use('/equipos', equiposRoutes);

export default router;
