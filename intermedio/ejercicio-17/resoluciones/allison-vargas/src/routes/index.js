import { Router } from 'express';
import authRoutes from './auth.routes.js';
import rolesRoutes from './roles.routes.js';
import destinosRoutes from './destinos.routes.js';
import toursRoutes from './tours.routes.js';
import reservasRoutes from './reservas.routes.js';
import usuariosRoutes from './usuarios.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'roles y permisos',
  });
});

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/destinos', destinosRoutes);
router.use('/tours', toursRoutes);
router.use('/reservas', reservasRoutes);
router.use('/usuarios', usuariosRoutes);

export default router;
