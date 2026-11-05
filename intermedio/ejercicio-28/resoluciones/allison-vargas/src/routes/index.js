import { Router } from 'express';
import { crearJugadoresController } from '../controllers/jugadores.controller.js';
import { crearPartidasController } from '../controllers/partidas.controller.js';
import { crearJugadoresRoutes } from './jugadores.routes.js';
import { crearPartidasRoutes } from './partidas.routes.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

export function crearRutas({ jugadores, partidas }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'coleccion de ejemplos HTTP',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/jugadores', crearJugadoresRoutes(crearJugadoresController(jugadores)));
  router.use('/partidas', crearPartidasRoutes(crearPartidasController(partidas)));

  return router;
}
