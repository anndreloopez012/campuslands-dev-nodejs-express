import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';

export function crearPersonajesRoutes({ personajes, inventario, misiones }) {
  const router = Router();

  router.route('/')
    .get(personajes.listar)
    .post(exigirJson, personajes.crear)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/ranking')
    .get(personajes.ranking)
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get(personajes.obtener)
    .patch(exigirJson, personajes.renombrar)
    .delete(personajes.eliminar)
    .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

  router.route('/:id/inventario')
    .get(inventario.listar)
    .post(exigirJson, inventario.agregar)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id/inventario/:itemId')
    .delete(inventario.quitar)
    .all(metodoNoPermitido(['DELETE']));

  router.route('/:id/misiones/:misionId/completar')
    .post(misiones.completar)
    .all(metodoNoPermitido(['POST']));

  return router;
}
