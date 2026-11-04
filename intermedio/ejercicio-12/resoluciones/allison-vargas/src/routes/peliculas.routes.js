import { Router } from 'express';
import * as controller from '../controllers/peliculas.controller.js';
import { cargarPelicula } from '../middlewares/cargarPelicula.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import resenasRoutes from './resenas.routes.js';
import repartoRoutes from './reparto.routes.js';

const router = Router();

router.param('peliculaId', cargarPelicula);

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:peliculaId')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

router.use('/:peliculaId/resenas', resenasRoutes);
router.use('/:peliculaId/reparto', repartoRoutes);

export default router;
