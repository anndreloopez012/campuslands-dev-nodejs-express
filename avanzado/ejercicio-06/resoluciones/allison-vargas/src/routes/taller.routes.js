import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { validarOrdenNueva } from '../validators/orden.js';
import { consultaOrdenes, validarAvance, validarProcesador, validarReclamo } from '../validators/trabajo.js';

export function crearTrabajadoresRouter({ trabajadores }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: trabajadores.listar() });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: trabajadores.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/reclamar')
    .post(catchAsync((req, res) => {
      const id = leerId(req.params.id);
      const reclamados = trabajadores.reclamar(id, validarReclamo(req.body));
      res.status(200).json({ ok: true, data: reclamados, total: reclamados.length });
    }))
    .all(metodoNoPermitido(['POST']));

  return router;
}

export function crearOrdenesRouter({ ordenes, permitirSimulaciones }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = ordenes.listar(consultaOrdenes(req.query));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const creada = ordenes.crear(validarOrdenNueva(req.body, { permitirSimulaciones }));
      res.set('Location', `${req.baseUrl}/${creada.id}`);
      res.status(201).json({ ok: true, data: creada });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: ordenes.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearSistemaRouter({ trabajos, procesador, sistema }) {
  const router = Router();

  router.route('/estadisticas')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: sistema.estadisticas() });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/muertas')
    .get(catchAsync((req, res) => {
      const data = trabajos.muertas();
      res.status(200).json({ ok: true, data, total: data.length });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/procesador/ejecutar')
    .post(catchAsync((req, res) => {
      const data = procesador.ejecutar(validarProcesador(req.body));
      res.status(200).json({ ok: true, data, total: data.length });
    }))
    .all(metodoNoPermitido(['POST']));

  router.route('/reloj')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: sistema.reloj() });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/reloj/avanzar')
    .post(exigirJson, catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: sistema.avanzarReloj(validarAvance(req.body).ms) });
    }))
    .all(metodoNoPermitido(['POST']));

  return router;
}
