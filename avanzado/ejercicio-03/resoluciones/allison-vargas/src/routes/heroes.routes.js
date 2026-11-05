import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { paginar } from '../utils/paginacion.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { validar } from '../middlewares/validar.js';
import { consultaHeroes, esquemaHeroe, esquemaHeroeEdicion } from '../validators/heroe.schema.js';
import { parametrosConId } from '../validators/comunes.schema.js';

const COMPARADORES = {
  id: (a, b) => a.id - b.id,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  dificultad: (a, b) => a.dificultad - b.dificultad || a.id - b.id,
  dificultad_desc: (a, b) => b.dificultad - a.dificultad || a.id - b.id,
};

export function crearHeroesRouter({ heroes }) {
  const router = Router();

  router.route('/')
    .get(validar({ consulta: consultaHeroes }), catchAsync((req, res) => {
      const { orden, pagina, limite, ...filtros } = req.datos.consulta;
      const { data, paginacion } = paginar(heroes.listar(filtros, COMPARADORES[orden]), pagina, limite);
      res.set('X-Total-Count', String(paginacion.total));
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .post(exigirJson, validar({ cuerpo: esquemaHeroe }), catchAsync((req, res) => {
      const creado = heroes.crear(req.datos.cuerpo);
      res.set('Location', `${req.baseUrl}/${creado.id}`);
      res.status(201).json({ ok: true, data: creado });
    }))
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(validar({ parametros: parametrosConId }), catchAsync((req, res) => {
      res.status(200).json({ ok: true, data: heroes.obtener(req.datos.parametros.id) });
    }))
    .patch(exigirJson, validar({ parametros: parametrosConId, cuerpo: esquemaHeroeEdicion }), catchAsync((req, res) => {
      const { parametros, cuerpo } = req.datos;
      res.status(200).json({ ok: true, data: heroes.actualizar(parametros.id, cuerpo) });
    }))
    .all(metodoNoPermitido(['GET', 'PATCH']));

  return router;
}
