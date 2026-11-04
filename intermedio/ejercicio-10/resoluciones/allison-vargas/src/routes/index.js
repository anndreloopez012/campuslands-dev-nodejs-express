import { Router } from 'express';
import jugadoresRoutes from './jugadores.routes.js';
import partidosRoutes from './partidos.routes.js';
import { campos } from '../controllers/ordenamiento.controller.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'ordenamiento de resultados',
  });
});

router.get('/orden/campos', campos);
router.use('/jugadores', jugadoresRoutes);
router.use('/partidos', partidosRoutes);

export default router;
