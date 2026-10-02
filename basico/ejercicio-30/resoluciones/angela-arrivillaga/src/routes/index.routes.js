import { Router } from 'express';
import motosRoutes from './motos.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'proyecto integrador basico'
  });
});

router.use('/motos', motosRoutes);

export default router;
