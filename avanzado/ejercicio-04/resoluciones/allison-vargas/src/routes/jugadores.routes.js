import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { validarConsultaJugadores, validarJugadorNuevo } from '../validators/jugador.js';

export function crearJugadoresRouter({ jugadores }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = jugadores.listar(validarConsultaJugadores(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const creado = jugadores.registrar(validarJugadorNuevo(req.body));
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      res.status(201).json({ ok: true, data: creado });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: jugadores.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
