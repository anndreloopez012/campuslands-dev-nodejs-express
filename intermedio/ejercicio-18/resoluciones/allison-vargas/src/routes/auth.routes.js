import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/registro')
  .post(controller.registrar)
  .all(metodoNoPermitido(['POST']));

router.route('/login')
  .post(controller.iniciarSesion)
  .all(metodoNoPermitido(['POST']));

router.route('/cambiar-password')
  .post(controller.cambiarPassword)
  .all(metodoNoPermitido(['POST']));

export default router;
