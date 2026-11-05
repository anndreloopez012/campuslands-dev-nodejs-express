import express, { Router } from 'express';
import { crear } from '../errores/index.js';
import { idempotente } from '../idempotencia/middleware.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { catchAsync } from '../utils/catchAsync.js';
import { leerId, terminar } from '../validators/comunes.js';

const json = [exigirTipo('application/json'), express.json({ limit: '4kb' })];

const identificarCliente = (req, res, next) => {
  const cliente = req.get('x-cliente-id');
  if (!/^[a-z0-9-]{3,40}$/.test(cliente ?? '')) return next(crear('CLIENTE_REQUERIDO'));
  req.cliente = cliente;
  return next();
};

export function crearEstudioRouter({ estudio, almacen }) {
  const router = Router();
  const unaVez = idempotente({ almacen });

  router.route('/artistas')
    .get((req, res) => res.status(200).json({ ok: true, data: estudio.artistas() }))
    .all(metodoNoPermitido(['GET']));

  router.route('/comisiones')
    .get(identificarCliente, (req, res) => res.status(200).json({ ok: true, data: estudio.listarComisiones(req.cliente) }))
    .post(...json, identificarCliente, unaVez, (req, res) => {
      const comision = estudio.crearComision(req.cliente, req.body);
      res.set('Location', `${req.baseUrl}/comisiones/${comision.id}`).status(201).json({ ok: true, data: comision });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/comisiones/:id')
    .get((req, res) => res.status(200).json({ ok: true, data: estudio.obtenerComision(leerId(req.params.id)) }))
    .all(metodoNoPermitido(['GET']));

  router.route('/comisiones/:id/estado')
    .put(...json, (req, res) => {
      const { comision, cambio } = estudio.cambiarEstado(leerId(req.params.id), req.body);
      res.status(200).json({ ok: true, data: comision, cambio });
    })
    .all(metodoNoPermitido(['PUT']));

  router.route('/pagos')
    .get((req, res) => {
      let comisionId;
      if (req.query.comisionId !== undefined) {
        comisionId = /^\d{1,9}$/.test(req.query.comisionId) ? Number(req.query.comisionId) : terminar([{ campo: 'comisionId', mensaje: 'debe ser un entero' }]);
      }
      res.status(200).json({ ok: true, data: estudio.listarPagos(comisionId) });
    })
    .post(...json, identificarCliente, unaVez, catchAsync(async (req, res) => {
      const resultado = await estudio.pagar(req.cliente, req.body);
      res.set('Location', `${req.baseUrl}/pagos/${resultado.pago.id}`).status(201).json({ ok: true, data: resultado });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  return router;
}
