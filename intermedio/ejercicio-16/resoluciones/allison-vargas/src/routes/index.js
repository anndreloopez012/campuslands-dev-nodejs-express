import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productosRoutes from './productos.routes.js';
import favoritosRoutes from './favoritos.routes.js';
import pedidosRoutes from './pedidos.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas protegidas',
  });
});

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/favoritos', favoritosRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/admin', adminRoutes);

export default router;
