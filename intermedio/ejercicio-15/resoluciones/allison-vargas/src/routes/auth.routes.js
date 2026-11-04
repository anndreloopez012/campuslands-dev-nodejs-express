import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/registro')
  .post(controller.registrar)
  .all(metodoNoPermitido(['POST']));

router.route('/login')
  .post(controller.iniciarSesion)
  .all(metodoNoPermitido(['POST']));

router.route('/perfil')
  .get(autenticar, controller.perfil)
  .all(metodoNoPermitido(['GET']));

router.route('/token')
  .get(autenticar, controller.token)
  .all(metodoNoPermitido(['GET']));

export default router;
