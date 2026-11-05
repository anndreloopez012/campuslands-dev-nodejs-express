import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerIsrcDeRuta, leerListadoCanciones, leerPagina } from '../validators/cancion.js';

export function crearCancionesRouter({ canciones }) {
  const router = Router();

  router.route('/canciones')
    .get((req, res) => {
      const { pagina, limite, filtros } = leerListadoCanciones(req.query);
      const { data, paginacion } = canciones.listar({ pagina, limite, filtros });
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/canciones/:isrc')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: canciones.obtener(leerIsrcDeRuta(req.params.isrc)) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/artistas')
    .get((req, res) => {
      const { data, paginacion } = canciones.artistas(leerPagina(req.query));
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/resumen')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: canciones.resumen() });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
