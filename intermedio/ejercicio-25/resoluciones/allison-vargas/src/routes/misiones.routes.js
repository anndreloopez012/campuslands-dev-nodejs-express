import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

export function crearMisionesRoutes(misiones) {
  const router = Router();

  router.route('/')
    .get(misiones.listar)
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get(misiones.obtener)
    .all(metodoNoPermitido(['GET']));

  return router;
}
