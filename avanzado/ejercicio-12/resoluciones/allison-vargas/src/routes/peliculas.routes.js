import express, { Router } from 'express';
import { createGzip } from 'node:zlib';
import { Readable, pipeline } from 'node:stream';
import { esFresco } from '../domain/http.js';
import { esquemaDe } from '../domain/proyeccion.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { leerEsquema, leerExportacion, leerListado } from '../validators/pelicula.js';

export function crearPeliculasRouter({ peliculas, registro = () => {} }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const { data, paginacion } = peliculas.listar(leerListado(req.query));
      res.status(200).json({ ok: true, data, paginacion });
    })
    .post(exigirTipo('application/json'), express.json({ limit: '10kb' }), (req, res) => {
      const creada = peliculas.crear(req.body);
      res.set('Location', `${req.baseUrl}/${creada.id}`).status(201).json({ ok: true, data: creada });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/exportar')
    .get((req, res, next) => {
      let parametros;
      try {
        parametros = leerExportacion(req.query);
      } catch (error) {
        return next(error);
      }
      const exportacion = peliculas.abrirExportacion(parametros);
      const comprimir = parametros.compresion === 'auto' && req.acceptsEncodings('gzip', 'identity') === 'gzip';
      const etag = comprimir ? exportacion.etag.replace(/"$/, '-gz"') : exportacion.etag;
      res.set({
        'Content-Type': exportacion.contentType,
        'Cache-Control': 'private, no-cache',
        ETag: etag,
        'Last-Modified': exportacion.modificadoEn.toUTCString(),
        Vary: 'Accept-Encoding',
        'X-Total-Registros': String(exportacion.total),
        'X-Content-Type-Options': 'nosniff',
      });
      if (parametros.descargar) res.set('Content-Disposition', `attachment; filename="${exportacion.nombreArchivo}"`);
      if (esFresco(req, { etag, modificadoEn: exportacion.modificadoEn })) return res.status(304).end();
      res.status(200);
      const etapas = [Readable.from(exportacion.trozos(), { objectMode: false })];
      if (comprimir) {
        res.set('Content-Encoding', 'gzip');
        etapas.push(createGzip());
      }
      return pipeline(...etapas, res, (error) => {
        if (error && error.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
          registro({ nivel: 'error', mensaje: error.message, pila: error.stack, ruta: req.originalUrl });
        }
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/exportar/esquema')
    .get((req, res) => {
      const { campos } = leerEsquema(req.query);
      res.status(200).type('application/schema+json').send(JSON.stringify(esquemaDe(campos)));
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: peliculas.obtener(leerId(req.params.id)) });
    })
    .delete((req, res) => {
      res.status(200).json({ ok: true, data: peliculas.eliminar(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));

  return router;
}
