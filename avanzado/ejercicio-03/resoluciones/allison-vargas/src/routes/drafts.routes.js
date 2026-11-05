import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { paginar } from '../utils/paginacion.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { validar } from '../middlewares/validar.js';
import { consultaDrafts, esquemaDraft } from '../validators/draft.schema.js';
import { parametrosConId } from '../validators/comunes.schema.js';

const COMPARADORES = {
  id: (a, b) => a.id - b.id,
  id_desc: (a, b) => b.id - a.id,
};

export function crearDraftsRouter({ drafts }) {
  const router = Router();

  router.route('/')
    .get(validar({ consulta: consultaDrafts }), catchAsync((req, res) => {
      const { orden, pagina, limite, ...filtros } = req.datos.consulta;
      const { data, paginacion } = paginar(drafts.listar(filtros, COMPARADORES[orden]), pagina, limite);
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, validar({ cuerpo: esquemaDraft }), catchAsync((req, res) => {
      const creado = drafts.crear(req.datos.cuerpo);
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      res.status(201).json({ ok: true, data: creado });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(validar({ parametros: parametrosConId }), catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: drafts.obtener(req.datos.parametros.id) });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
