import { Router } from 'express';
import proyectosRoutes from './proyectos.routes.js';
import subidasRoutes from './subidas.routes.js';
import reglasRoutes from './reglas.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'subida simulada de archivos',
  });
});

router.use('/reglas', reglasRoutes);
router.use('/proyectos', proyectosRoutes);
router.use('/subidas', subidasRoutes);

export default router;
