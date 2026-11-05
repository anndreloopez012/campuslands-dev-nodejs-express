import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId } from '../validators/comunes.js';
import { leerExportacion, leerListado, leerOpcionesDeLectura } from '../validators/partido.js';
import { cuerpoCsv } from './csv.routes.js';

export function crearPartidosRouter({ partidos, importador }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const { pagina, limite, filtros } = leerListado(req.query);
      const { data, paginacion } = partidos.listar({ pagina, limite, filtros });
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/importar')
    .post(...cuerpoCsv, (req, res) => {
      const opciones = leerOpcionesDeLectura(req.query, { importar: true });
      const resultado = importador.importar(req.body, { charset: req.charset, ...opciones });
      res.status(resultado.dryRun ? 200 : 201).json({ ok: true, data: resultado });
    })
    .all(metodoNoPermitido(['POST']));

  router.route('/exportar')
    .get((req, res) => {
      const { texto, filas } = partidos.exportar(leerExportacion(req.query));
      res.status(200).set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="partidos.csv"',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Total-Filas': String(filas),
      }).send(texto);
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: partidos.obtener(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
