import { Router } from 'express';
import configRoutes from './config.routes.js';
import tatuadoresRoutes from './tatuadores.routes.js';
import citasRoutes from './citas.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'dotenv y config',
  });
});

router.use('/config', configRoutes);
router.use('/tatuadores', tatuadoresRoutes);
router.use('/citas', citasRoutes);

export default router;
