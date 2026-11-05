import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { leerFiltroTexto } from '../validators/prestamo.js';

export function crearLibrosRouter({ biblioteca }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const genero = leerFiltroTexto(req.query, 'genero', biblioteca.generos());
      res.status(200).json({ ok: true, data: biblioteca.listarLibros({ genero }) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: biblioteca.obtenerLibro(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearPrestamosRouter({ biblioteca }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const activos = leerFiltroTexto(req.query, 'activos', ['true', 'false']);
      const data = biblioteca.listarPrestamos({ activos: activos === undefined ? undefined : activos === 'true' });
      res.status(200).json({ ok: true, data });
    })
    .post(exigirTipo('application/json'), express.json({ limit: '2kb' }), (req, res) => {
      const creado = biblioteca.prestar(req.body);
      res.set('Location', `${req.baseUrl}/${creado.id}`).status(201).json({ ok: true, data: creado });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id/devolucion')
    .post((req, res) => {
      res.status(200).json({ ok: true, data: biblioteca.devolver(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}
