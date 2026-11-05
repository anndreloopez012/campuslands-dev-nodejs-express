import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { consultaSesiones, validarMotivo, validarSesionNueva, validarVuelta } from '../validators/pista.js';

export function crearSesionesRouter({ sesiones, circuitos, autos }) {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const { data, paginacion } = sesiones.listar(consultaSesiones(req.query, { circuitos }));
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, catchAsync((req, res) => {
      const sesion = sesiones.crear(validarSesionNueva(req.body, { circuitos, autos }));
      res.set('Location', `${req.baseUrl}/${sesion.id}`);
      res.status(201).json({ ok: true, data: sesion });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: sesiones.obtener(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/vueltas')
    .post(exigirJson, catchAsync((req, res) => {
      const sesion = sesiones.registrarVuelta(leerId(req.params.id), validarVuelta(req.body));
      res.status(201).json({ ok: true, data: sesion });
    }))
    .all(metodoNoPermitido(['POST']));

  for (const accion of ['finalizar', 'abortar']) {
    router.route(`/:id/${accion}`)
      .post(catchAsync((req, res) => {
        const sesion = sesiones[accion](leerId(req.params.id), validarMotivo(req.body));
        res.status(200).json({ ok: true, data: sesion });
      }))
      .all(metodoNoPermitido(['POST']));
  }

  return router;
}
