import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import hashRoutes from './hash.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'hash de passwords conceptual',
  });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/hash', hashRoutes);

export default router;
