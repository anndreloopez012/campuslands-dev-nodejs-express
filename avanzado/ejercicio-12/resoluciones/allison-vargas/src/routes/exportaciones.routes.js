import { Router } from 'express';
import { coincideEtag } from '../domain/http.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { leerExportacion, leerPaginaSimple } from '../validators/pelicula.js';

export function crearExportacionesRouter({ exportaciones }) {
  const router = Router();

  router.route('/')
    .post((req, res) => {
      const creada = exportaciones.crear(leerExportacion(req.query, { conNombre: true }));
      res.set('Location', `${req.baseUrl}/${creada.id}`).status(201).json({ ok: true, data: creada });
    })
    .get((req, res) => {
      const { data, paginacion } = exportaciones.listar(leerPaginaSimple(req.query));
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: exportaciones.obtener(leerId(req.params.id)) });
    })
    .delete((req, res) => {
      res.status(200).json({ ok: true, data: exportaciones.eliminar(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));

  router.route('/:id/descargar')
    .get((req, res) => {
      const exportacion = exportaciones.descargar(leerId(req.params.id));
      const etag = `"${exportacion.sha256}"`;
      res.set({
        ETag: etag,
        Digest: exportacion.digest,
        'Cache-Control': 'private, max-age=31536000, immutable',
        'Content-Type': exportacion.contentType,
        'Content-Disposition': `attachment; filename="${exportacion.nombreArchivo}"`,
        'X-Content-Type-Options': 'nosniff',
      });
      if (coincideEtag(req.headers['if-none-match'], etag)) {
        res.status(304).end();
        return;
      }
      res.status(200).send(exportacion.contenido);
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
