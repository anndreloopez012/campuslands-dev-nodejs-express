import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';

export function crearAuthRoutes(controller, protegido) {
  const router = Router();

  router.route('/login')
    .post(exigirJson, controller.login)
    .all(metodoNoPermitido(['POST']));

  router.route('/yo')
    .get(protegido, controller.yo)
    .all(metodoNoPermitido(['GET']));

  return router;
}
