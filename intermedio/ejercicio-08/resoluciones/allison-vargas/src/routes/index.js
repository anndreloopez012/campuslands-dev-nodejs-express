import { Router } from 'express';
import hiperdeportivosRoutes from './hiperdeportivos.routes.js';
import contextoRoutes from './contexto.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware de request id',
  });
});

router.use('/hiperdeportivos', hiperdeportivosRoutes);
router.use('/contexto', contextoRoutes);

export default router;
