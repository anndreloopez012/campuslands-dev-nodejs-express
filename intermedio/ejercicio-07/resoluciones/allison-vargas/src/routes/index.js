import { Router } from 'express';
import autosRoutes from './autos.routes.js';
import erroresRoutes from './errores.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware de errores',
  });
});

router.use('/autos', autosRoutes);
router.use('/errores', erroresRoutes);

export default router;
