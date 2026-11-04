import { Router } from 'express';
import authRoutes from './auth.routes.js';
import librosRoutes from './libros.routes.js';
import favoritosRoutes from './favoritos.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'autenticacion simulada',
  });
});

router.use('/auth', authRoutes);
router.use('/libros', librosRoutes);
router.use('/favoritos', favoritosRoutes);
router.use('/usuarios', usuariosRoutes);

export default router;
