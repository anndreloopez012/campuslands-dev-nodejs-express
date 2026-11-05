import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';

const json = [exigirTipo('application/json'), express.json({ limit: '2kb' })];

export function crearZonaRouter({ zona }) {
  const router = Router();
  router.use((req, res, next) => {
    req.usuario = zona.autenticar(req.get('authorization'));
    next();
  });
  const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });

  router.route('/yo').get((req, res) => ok(res, zona.perfil(req.usuario))).all(metodoNoPermitido(['GET']));

  router.route('/autorizacion/explicar')
    .post(...json, (req, res) => ok(res, zona.explicar(req.usuario, req.body)))
    .all(metodoNoPermitido(['POST']));

  router.route('/roles').get((req, res) => ok(res, zona.roles(req.usuario))).all(metodoNoPermitido(['GET']));

  router.route('/saltos')
    .get((req, res) => ok(res, zona.listarSaltos(req.usuario)))
    .post(...json, (req, res) => {
      const salto = zona.crearSalto(req.usuario, req.body);
      res.set('Location', `${req.baseUrl}/saltos/${salto.id}`);
      ok(res, salto, 201);
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/saltos/:id')
    .get((req, res) => ok(res, zona.obtenerSalto(req.usuario, leerId(req.params.id))))
    .all(metodoNoPermitido(['GET']));

  router.route('/saltos/:id/resolucion')
    .post(...json, (req, res) => ok(res, zona.resolverSalto(req.usuario, leerId(req.params.id), req.body)))
    .all(metodoNoPermitido(['POST']));

  router.route('/vuelos')
    .get((req, res) => ok(res, zona.listarVuelos()))
    .post(...json, (req, res) => ok(res, zona.crearVuelo(req.usuario, req.body), 201))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/vuelos/:id/manifiesto')
    .get((req, res) => ok(res, zona.manifiesto(req.usuario, leerId(req.params.id))))
    .all(metodoNoPermitido(['GET']));

  router.route('/vuelos/:id/despegue')
    .post((req, res) => ok(res, zona.despegar(req.usuario, leerId(req.params.id))))
    .all(metodoNoPermitido(['POST']));

  router.route('/clima')
    .get((req, res) => ok(res, zona.clima()))
    .put(...json, (req, res) => ok(res, zona.cambiarClima(req.usuario, req.body)))
    .all(metodoNoPermitido(['GET', 'PUT']));

  return router;
}
