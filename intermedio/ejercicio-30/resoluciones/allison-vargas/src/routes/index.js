import { Router } from 'express';
import { crearAuthController } from '../controllers/auth.controller.js';
import { crearClientesController } from '../controllers/clientes.controller.js';
import { crearMotosController } from '../controllers/motos.controller.js';
import { crearRepuestosController } from '../controllers/repuestos.controller.js';
import { crearOrdenesController } from '../controllers/ordenes.controller.js';
import { crearAuthRoutes } from './auth.routes.js';
import { crearClientesRoutes } from './clientes.routes.js';
import { crearMotosRoutes } from './motos.routes.js';
import { crearRepuestosRoutes } from './repuestos.routes.js';
import { crearOrdenesRoutes } from './ordenes.routes.js';
import { autenticar, exigirRol } from '../middlewares/autenticar.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { enviar } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearRutas({ auth, clientes, motos, repuestos, ordenes, reportes }) {
  const router = Router();
  const protegido = autenticar(auth);
  const ordenesController = crearOrdenesController(ordenes);

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'proyecto integrador intermedio',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/auth', crearAuthRoutes(crearAuthController(auth), protegido));
  router.use('/clientes', protegido, crearClientesRoutes(crearClientesController(clientes)));
  router.use('/motos', protegido, crearMotosRoutes(crearMotosController(motos)));
  router.use('/repuestos', protegido, crearRepuestosRoutes(crearRepuestosController(repuestos)));
  router.use('/ordenes', protegido, crearOrdenesRoutes(ordenesController));

  router.route('/mecanicos')
    .get(protegido, ordenesController.mecanicos)
    .all(metodoNoPermitido(['GET']));

  router.route('/reportes/resumen')
    .get(protegido, exigirRol('admin'), catchAsync((req, res) => enviar(res, reportes.resumen())))
    .all(metodoNoPermitido(['GET']));

  return router;
}
