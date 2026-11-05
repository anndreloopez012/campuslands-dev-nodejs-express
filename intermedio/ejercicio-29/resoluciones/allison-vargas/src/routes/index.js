import { Router } from 'express';
import { crearEquiposController } from '../controllers/equipos.controller.js';
import { crearPartidosController } from '../controllers/partidos.controller.js';
import { crearTablaController } from '../controllers/tabla.controller.js';
import { crearEquiposRoutes } from './equipos.routes.js';
import { crearPartidosRoutes } from './partidos.routes.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

export function crearRutas({ equipos, partidos, tabla }) {
  const router = Router();
  const controladorTabla = crearTablaController(tabla);

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'refactor de API',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/tabla')
    .get(controladorTabla.obtener)
    .all(metodoNoPermitido(['GET']));

  router.use('/equipos', crearEquiposRoutes(crearEquiposController(equipos)));
  router.use('/partidos', crearPartidosRoutes(crearPartidosController(partidos)));

  return router;
}
