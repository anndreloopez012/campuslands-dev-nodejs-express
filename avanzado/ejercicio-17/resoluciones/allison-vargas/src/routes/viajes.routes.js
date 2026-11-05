import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { autenticar } from './auth.routes.js';

export function crearDestinosRouter({ reservas }) {
  const router = Router();
  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: reservas.destinos() });
    })
    .all(metodoNoPermitido(['GET']));
  return router;
}

export function crearReservasRouter({ auth, reservas }) {
  const router = Router();
  router.use(autenticar(auth));

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: reservas.listar(req.usuario) });
    })
    .post(exigirTipo('application/json'), express.json({ limit: '2kb' }), (req, res) => {
      const reserva = reservas.crear(req.usuario, req.body);
      res.set('Location', `${req.baseUrl}/${reserva.id}`).status(201).json({ ok: true, data: reserva });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .delete((req, res) => {
      res.status(200).json({ ok: true, data: reservas.cancelar(req.usuario, leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['DELETE']));

  return router;
}
