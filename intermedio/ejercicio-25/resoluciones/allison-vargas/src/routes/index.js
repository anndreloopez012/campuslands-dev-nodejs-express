import { Router } from 'express';
import { crearPersonajesController } from '../controllers/personajes.controller.js';
import { crearInventarioController } from '../controllers/inventario.controller.js';
import { crearMisionesController } from '../controllers/misiones.controller.js';
import { crearPersonajesRoutes } from './personajes.routes.js';
import { crearMisionesRoutes } from './misiones.routes.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { BASE_RUTAS, CATALOGO_RUTAS } from '../constants/rutas.js';

export function crearRutas({ personajes, inventario, misiones }) {
  const router = Router();
  const controladorMisiones = crearMisionesController(misiones);

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'testing de rutas',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/rutas')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: { base: BASE_RUTAS, rutas: CATALOGO_RUTAS } });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/personajes', crearPersonajesRoutes({
    personajes: crearPersonajesController(personajes),
    inventario: crearInventarioController(inventario),
    misiones: controladorMisiones,
  }));
  router.use('/misiones', crearMisionesRoutes(controladorMisiones));

  return router;
}
