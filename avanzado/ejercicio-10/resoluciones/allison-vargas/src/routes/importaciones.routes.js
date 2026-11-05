import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId, leerPaginacion, rechazarSobrantes, terminar } from '../validators/comunes.js';

export function crearImportacionesRouter({ importaciones }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const errores = [];
      rechazarSobrantes(req.query, ['pagina', 'limite'], errores);
      const { pagina, limite } = leerPaginacion(req.query, errores);
      terminar(errores);
      const { data, paginacion } = importaciones.listar({ pagina, limite });
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: importaciones.obtener(leerId(req.params.id)) });
    })
    .delete((req, res) => {
      res.status(200).json({ ok: true, data: importaciones.revertir(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET', 'DELETE']));

  return router;
}
