import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { crearHttp } from '../http/errores-http.js';
import { listarCatalogo } from '../http/problemas.js';
import { leerFiltroTexto, leerOpcion, terminar } from '../validators/comunes.js';
import { CATEGORIAS } from '../domain/errores/index.js';

export function crearErroresRouter() {
  const router = Router();

  router.route('/')
    .get(catchAsync((req, res) => {
      const errores = [];
      const categoria = leerOpcion(req.query, 'categoria', [...CATEGORIAS, 'http'], errores, { requerido: false });
      const origen = leerOpcion(req.query, 'origen', ['dominio', 'http'], errores, { requerido: false });
      const buscar = leerFiltroTexto(req.query, 'buscar', errores);
      terminar(errores);
      const termino = buscar?.toLowerCase();
      const data = listarCatalogo().filter((entrada) =>
        (!categoria || entrada.categoria === categoria)
        && (!origen || entrada.origen === origen)
        && (!termino || entrada.codigo.toLowerCase().includes(termino)));
      res.status(200).json({ ok: true, data, total: data.length });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:codigo')
    .get(catchAsync((req, res) => {
      const entrada = listarCatalogo().find((item) => item.codigo === req.params.codigo);
      if (!entrada) {
        throw crearHttp('CODIGO_DESCONOCIDO', `No existe el codigo de error ${req.params.codigo}`);
      }
      res.status(200).json({ ok: true, data: entrada });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
