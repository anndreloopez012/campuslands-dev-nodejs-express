import { Router } from 'express';
import authRoutes from './auth.routes.js';
import menuRoutes from './menu.routes.js';
import pedidosRoutes from './pedidos.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'JWT basico',
  });
});

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/pedidos', pedidosRoutes);

export default router;
