import { Router } from 'express';
import { pipeline } from 'node:stream';
import { catchAsync } from '../utils/catchAsync.js';
import { exigirTipo } from '../middlewares/exigirTipo.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import {
  leerEstadisticas, leerExportacion, leerImportacion, leerListado,
} from '../validators/combates.js';

export function crearCombatesRouter({ combates }) {
  const router = Router();

  router.route('/')
    .get(catchAsync(async (req, res) => {
      const { pagina, limite, filtros } = leerListado(req.query);
      const { data, paginacion } = await combates.listar({ pagina, limite, filtros });
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/exportar')
    .get((req, res, next) => {
      let peticion;
      try {
        peticion = leerExportacion(req.query);
      } catch (error) {
        return next(error);
      }
      const { contentType, nombreArchivo, origen, transformador } = combates.abrirExportacion(peticion);
      res.status(200).set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      return pipeline(origen, transformador, res, () => {});
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/estadisticas')
    .get(catchAsync(async (req, res) => {
      const { filtros } = leerEstadisticas(req.query);
      res.status(200).json({ ok: true, data: await combates.estadisticas({ filtros }) });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/importar')
    .post(exigirTipo('application/x-ndjson'), catchAsync(async (req, res) => {
      const { modo } = leerImportacion(req.query);
      const resultado = await combates.importar(req, { modo });
      res.status(201).json({ ok: true, data: resultado });
    }))
    .all(metodoNoPermitido(['POST']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: combates.obtener(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
