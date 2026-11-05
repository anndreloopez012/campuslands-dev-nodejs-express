import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { modoDeCache, responderConCache } from '../utils/respuestaCache.js';
import { leerId } from '../validators/comunes.js';
import {
  consultaAutos,
  consultaCotizacion,
  validarAutoNuevo,
  validarCambios,
  validarMarca,
} from '../validators/auto.js';

export function crearAutosRouter({ autos }) {
  const router = Router();

  router.route('/')
    .get(catchAsync(async (req, res) => {
      const { data, paginacion, estado, restanteMs } = await autos.listar(consultaAutos(req.query), modoDeCache(req));
      res.set('X-Total-Count', String(paginacion.total));
      responderConCache(req, res, { data, estado, restanteMs, extras: { paginacion } });
    }))
    .post(exigirJson, catchAsync(async (req, res) => {
      const auto = await autos.crear(validarAutoNuevo(req.body));
      res.set('Location', `${req.baseUrl}/${auto.id}`);
      res.status(201).json({ ok: true, data: auto });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync(async (req, res) => {
      const resultado = await autos.obtener(leerId(req.params.id), modoDeCache(req));
      responderConCache(req, res, resultado);
    }))
    .patch(exigirJson, catchAsync(async (req, res) => {
      const auto = await autos.actualizar(leerId(req.params.id), validarCambios(req.body));
      res.status(200).json({ ok: true, data: auto });
    }))
    .delete(catchAsync(async (req, res) => {
      await autos.eliminar(leerId(req.params.id));
      res.status(204).end();
    }))
    .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

  router.route('/:id/cotizacion')
    .get(catchAsync(async (req, res) => {
      const resultado = await autos.cotizar(leerId(req.params.id), consultaCotizacion(req.query), modoDeCache(req));
      responderConCache(req, res, resultado);
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearMarcasRouter({ marcas }) {
  const router = Router();

  router.route('/:marca/resumen')
    .get(catchAsync(async (req, res) => {
      const resultado = await marcas.resumen(validarMarca(req.params.marca), modoDeCache(req));
      responderConCache(req, res, resultado);
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
