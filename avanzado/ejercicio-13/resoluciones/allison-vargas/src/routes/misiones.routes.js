import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId, leerOpcion, terminar } from '../validators/comunes.js';

const json = [exigirTipo('application/json'), express.json({ limit: '5kb' })];
const ESTADOS = ['planificada', 'en_curso', 'completada', 'fallida'];

export function crearNavesRouter({ misiones }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: misiones.listarNaves() });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: misiones.obtenerNave(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/telemetria')
    .post(...json, (req, res) => {
      const resultado = misiones.telemetria(leerId(req.params.id), req.body, req.log);
      res.status(202).json({ ok: true, data: resultado });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}

export function crearMisionesRouter({ misiones }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const errores = [];
      const estado = leerOpcion(req.query, 'estado', ESTADOS, errores, { requerido: false });
      terminar(errores);
      res.status(200).json({ ok: true, data: misiones.listarMisiones({ estado }) });
    })
    .post(...json, (req, res) => {
      const creada = misiones.crearMision(req.body, req.log);
      res.set('Location', `${req.baseUrl}/${creada.id}`).status(201).json({ ok: true, data: creada });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: misiones.obtenerMision(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/lanzar')
    .post((req, res) => {
      res.status(200).json({ ok: true, data: misiones.lanzar(leerId(req.params.id), req.log) });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/finalizar')
    .post(...json, (req, res) => {
      res.status(200).json({ ok: true, data: misiones.finalizar(leerId(req.params.id), req.body, req.log) });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}
