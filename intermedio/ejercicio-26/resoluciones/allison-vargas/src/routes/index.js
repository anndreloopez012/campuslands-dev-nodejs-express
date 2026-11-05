import { Router } from 'express';
import { crearJugadoresController } from '../controllers/jugadores.controller.js';
import { crearPartidasController } from '../controllers/partidas.controller.js';
import { crearSistemaController } from '../controllers/sistema.controller.js';
import { crearJugadoresRoutes } from './jugadores.routes.js';
import { crearPartidasRoutes } from './partidas.routes.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

export function crearRutas({ jugadores, partidas, salud, eventos }) {
  const router = Router();
  const sistema = crearSistemaController({ salud, eventos });

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'mock de dependencias',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/salud')
    .get(sistema.salud)
    .all(metodoNoPermitido(['GET']));

  router.route('/eventos')
    .get(sistema.eventos)
    .all(metodoNoPermitido(['GET']));

  router.use('/jugadores', crearJugadoresRoutes(crearJugadoresController(jugadores)));
  router.use('/partidas', crearPartidasRoutes(crearPartidasController(partidas)));

  return router;
}
