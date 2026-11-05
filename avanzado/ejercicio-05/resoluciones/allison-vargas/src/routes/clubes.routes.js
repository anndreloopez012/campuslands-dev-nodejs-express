import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { consultaClubes, consultaJugadores } from '../validators/consultas.js';

export function crearClubesRouter({ clubes }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = clubes.listar(consultaClubes(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: clubes.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearJugadoresRouter({ jugadores }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = jugadores.listar(consultaJugadores(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: jugadores.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
