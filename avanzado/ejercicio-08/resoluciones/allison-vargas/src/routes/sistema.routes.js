import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { validarBuzon } from '../validators/pista.js';

export function crearBuzonesRouter({ buzones }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const data = buzones.listar();
      res.status(200).json({ ok: true, data, total: data.length });
    })
    .post(exigirJson, catchAsync((req, res) => {
      const buzon = buzones.crear(validarBuzon(req.body));
      res.set('Location', `${req.baseUrl}/${buzon.id}`);
      res.status(201).json({ ok: true, data: buzon });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: buzones.obtener(leerId(req.params.id)) });
    }))
    .delete(catchAsync((req, res) => {
      buzones.eliminar(leerId(req.params.id));
      res.status(204).end();
    }))
    .all(metodoNoPermitido(['GET', 'DELETE']));

  router.route('/:id/vaciar')
    .post(catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: buzones.vaciar(leerId(req.params.id)) });
    }))
    .all(metodoNoPermitido(['POST']));

  return router;
}

export function crearCatalogoRouter({ catalogo }) {
  const router = Router();
  const lista = (ruta, leer) => router.route(ruta)
    .get((req, res) => {
      const data = leer();
      res.status(200).json({ ok: true, data, total: data.length });
    })
    .all(metodoNoPermitido(['GET']));
  lista('/circuitos', catalogo.circuitos);
  lista('/autos', catalogo.autos);
  lista('/records', catalogo.records);
  return router;
}

export function crearBusRouter({ sistema }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: sistema.estadisticas() });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/suscripciones')
    .get((req, res) => {
      const data = sistema.suscripciones({ evento: typeof req.query.evento === 'string' ? req.query.evento : undefined });
      res.status(200).json({ ok: true, data, total: data.length });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/fallos')
    .get((req, res) => {
      const data = sistema.fallos();
      res.status(200).json({ ok: true, data, total: data.length });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
