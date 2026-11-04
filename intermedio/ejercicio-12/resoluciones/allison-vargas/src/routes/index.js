import { Router } from 'express';
import peliculasRoutes from './peliculas.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'subrecursos REST',
  });
});

router.use('/peliculas', peliculasRoutes);

export default router;
