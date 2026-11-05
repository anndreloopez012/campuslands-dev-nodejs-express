import { Router } from 'express';
import { cors } from '../middlewares/cors.js';
import { politicas } from '../config/cors.js';
import obrasRoutes from './obras.routes.js';
import galeriaRoutes from './galeria.routes.js';
import corsRoutes from './cors.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'CORS controlado',
  });
});

router.use('/cors', cors(politicas.publica), corsRoutes);
router.use('/galeria', cors(politicas.publica), galeriaRoutes);
router.use('/obras', cors(politicas.restringida), obrasRoutes);

export default router;
