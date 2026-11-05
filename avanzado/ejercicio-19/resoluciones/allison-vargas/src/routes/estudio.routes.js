import { randomUUID } from 'node:crypto';
import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { leerFiltrosAuditoria } from '../validators/estudio.js';

const json = [exigirTipo('application/json'), express.json({ limit: '4kb' })];

export function crearEstudioRouter({ estudio, auditoria }) {
  const router = Router();

  router.use((req, res, next) => {
    const recibido = req.get('x-request-id');
    req.contexto = {
      requestId: /^[\w.-]{8,64}$/.test(recibido ?? '') ? recibido : randomUUID(),
      ip: req.ip,
    };
    res.set('X-Request-Id', req.contexto.requestId);
    req.actor = estudio.actor(req.get('x-usuario-id'));
    next();
  });

  const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
  const id = (req) => leerId(req.params.id);

  router.route('/clientes/:id')
    .get((req, res) => ok(res, estudio.verCliente(req.actor, id(req), req.contexto)))
    .all(metodoNoPermitido(['GET']));

  router.route('/citas')
    .get((req, res) => ok(res, estudio.listarCitas(req.actor)))
    .post(...json, (req, res) => {
      const cita = estudio.crearCita(req.actor, req.body, req.contexto);
      res.set('Location', `${req.baseUrl}/citas/${cita.id}`);
      ok(res, cita, 201);
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/citas/:id')
    .patch(...json, (req, res) => ok(res, estudio.editarCita(req.actor, id(req), req.body, req.contexto)))
    .all(metodoNoPermitido(['PATCH']));

  router.route('/citas/:id/cancelacion')
    .post(...json, (req, res) => ok(res, estudio.cancelarCita(req.actor, id(req), req.body, req.contexto)))
    .all(metodoNoPermitido(['POST']));

  router.route('/citas/:id/consentimiento')
    .post(...json, (req, res) => ok(res, estudio.firmarConsentimiento(req.actor, id(req), req.body, req.contexto)))
    .all(metodoNoPermitido(['POST']));

  router.route('/citas/:id/realizacion')
    .post((req, res) => ok(res, estudio.realizarCita(req.actor, id(req), req.contexto)))
    .all(metodoNoPermitido(['POST']));

  router.route('/citas/:id/historial')
    .get((req, res) => ok(res, estudio.historial(req.actor, id(req), req.contexto)))
    .all(metodoNoPermitido(['GET']));

  router.route('/auditoria')
    .get((req, res) => {
      estudio.exigirAuditor(req.actor, req.contexto);
      const { data, siguiente } = auditoria.consultar(leerFiltrosAuditoria(req.query));
      res.set('Cache-Control', 'no-store').status(200).json({ ok: true, data, siguiente });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/auditoria/verificacion')
    .get((req, res) => {
      estudio.exigirAuditor(req.actor, req.contexto);
      ok(res, auditoria.verificar());
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/auditoria/exportacion')
    .get((req, res) => {
      estudio.exigirAuditor(req.actor, req.contexto);
      const lineas = auditoria.todas().map((e) => JSON.stringify(e)).join('\n');
      res.set({
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Content-Disposition': 'attachment; filename="auditoria.ndjson"',
        'Cache-Control': 'no-store',
      }).status(200).send(lineas ? `${lineas}\n` : '');
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
