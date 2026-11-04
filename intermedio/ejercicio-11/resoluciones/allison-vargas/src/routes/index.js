import { Router } from 'express';
import cancionesRoutes from './canciones.routes.js';
import artistasRoutes from './artistas.routes.js';
import { opciones } from '../controllers/busqueda.controller.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'busqueda textual',
  });
});

router.get('/busqueda/opciones', opciones);
router.use('/canciones', cancionesRoutes);
router.use('/artistas', artistasRoutes);

export default router;
