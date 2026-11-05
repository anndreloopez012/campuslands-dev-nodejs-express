import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { sinCache } from '../seguridad/cabeceras.js';
import { leerId } from '../validators/comunes.js';
import { paginaCarta } from '../vistas/carta.js';

const json = [exigirTipo('application/json'), express.json({ limit: '4kb' })];

export function crearPuestosRouter({ puestos }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      res.set('Cache-Control', 'public, max-age=60').status(200).json({ ok: true, data: puestos.listar() });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.set('Cache-Control', 'public, max-age=60').status(200).json({ ok: true, data: puestos.obtener(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/carta')
    .get((req, res) => {
      const id = leerId(req.params.id);
      const html = paginaCarta(puestos.obtener(id), puestos.resenas(id), res.locals.nonce);
      res.set('Cache-Control', 'no-cache').type('html').status(200).send(html);
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/resenas')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: puestos.resenas(leerId(req.params.id)) });
    })
    .post(...json, (req, res) => {
      res.status(201).json({ ok: true, data: puestos.agregarResena(leerId(req.params.id), req.body) });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  return router;
}

export function crearPedidosRouter({ puestos }) {
  const router = Router();
  // los pedidos tienen datos del cliente: nunca deben quedar en caches compartidas
  router.use(sinCache);

  router.route('/')
    .post(...json, (req, res) => {
      const pedido = puestos.crearPedido(req.body);
      res.set('Location', `${req.baseUrl}/${pedido.id}`).status(201).json({ ok: true, data: pedido });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: puestos.obtenerPedido(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
