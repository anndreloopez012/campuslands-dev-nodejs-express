import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { paginar } from '../utils/paginacion.js';
import { leerPaginaSimple } from '../validators/pelicula.js';

export function crearColeccionesRouter({ catalogo }) {
  const router = Router();
  for (const [ruta, origen] of [['directores', () => catalogo.directores], ['actores', () => catalogo.actores]]) {
    router.route(`/${ruta}`)
      .get((req, res) => {
        const { pagina, limite } = leerPaginaSimple(req.query);
        const { data, paginacion } = paginar(origen(), pagina, limite);
        res.status(200).json({ ok: true, data, paginacion });
      })
      .all(metodoNoPermitido(['GET']));
  }
  return router;
}
