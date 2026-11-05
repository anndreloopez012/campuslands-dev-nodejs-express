import express, { Router } from 'express';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { bloquearEstructurasPeligrosas, unicoPorParametro } from '../sanitizacion/estructura.js';
import { limpiarTexto } from '../sanitizacion/texto.js';
import { leerId, terminar } from '../validators/comunes.js';
import { leerBusqueda, validarPrevisualizacion } from '../validators/producto.js';
import { paginaFicha } from '../vistas/escape.js';

const json = [exigirTipo('application/json'), express.json({ limit: '16kb', strict: true }), bloquearEstructurasPeligrosas()];

export function crearProductosRouter({ productos }) {
  const router = Router();

  router.route('/')
    .get(unicoPorParametro(['talla']), (req, res) => {
      const { data, paginacion } = productos.buscar(leerBusqueda(req.query));
      res.status(200).json({ ok: true, data, paginacion });
    })
    .post(...json, (req, res) => {
      const { producto, cambios } = productos.crear(req.body);
      res.set('Location', `${req.baseUrl}/${producto.id}`).status(201).json({ ok: true, data: producto, cambios });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: productos.obtener(leerId(req.params.id)) });
    })
    .patch(...json, (req, res) => {
      const { producto, cambios } = productos.actualizar(leerId(req.params.id), req.body);
      res.status(200).json({ ok: true, data: producto, cambios });
    })
    .delete((req, res) => {
      res.status(200).json({ ok: true, data: productos.eliminar(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

  router.route('/:id/ficha')
    .get(unicoPorParametro(), (req, res) => {
      const producto = productos.obtener(leerId(req.params.id));
      let termino;
      if (req.query.resaltar !== undefined) {
        termino = limpiarTexto(req.query.resaltar).texto;
        if (termino.length < 2 || termino.length > 40) terminar([{ campo: 'resaltar', mensaje: 'debe tener entre 2 y 40 caracteres' }]);
      }
      res.set('Content-Security-Policy', "default-src 'none'; style-src 'self'").type('html').status(200)
        .send(paginaFicha(producto, termino));
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}

export function crearSanitizarRouter() {
  const router = Router();
  router.route('/')
    .post(...json, (req, res) => {
      const opciones = validarPrevisualizacion(req.body);
      const { texto, cambios } = limpiarTexto(opciones.texto, opciones);
      res.status(200).json({
        ok: true,
        data: {
          original: opciones.texto,
          limpio: texto,
          cambios,
          largoOriginal: [...opciones.texto].length,
          largoLimpio: [...texto].length,
        },
      });
    })
    .all(metodoNoPermitido(['POST']));
  return router;
}
