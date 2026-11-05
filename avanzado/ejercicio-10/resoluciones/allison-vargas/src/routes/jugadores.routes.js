import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerEnfrentamiento, leerRanking } from '../validators/partido.js';

export function crearJugadoresRouter({ jugadores }) {
  const router = Router();

  router.route('/ranking')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: jugadores.ranking(leerRanking(req.query)) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/enfrentamientos')
    .get((req, res) => {
      const { a, b } = leerEnfrentamiento(req.query);
      res.status(200).json({ ok: true, data: jugadores.enfrentamientos(a, b) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:nombre')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: jugadores.historial(req.params.nombre) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
