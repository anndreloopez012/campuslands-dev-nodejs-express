import { Router } from 'express';
import { CATEGORIAS } from '../constants/combates.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { leerId, leerPaginacion, rechazarSobrantes, terminar } from '../validators/comunes.js';

export function crearPeleadoresRouter({ peleadores }) {
  const router = Router();

  router.route('/')
    .get((req, res) => {
      const errores = [];
      rechazarSobrantes(req.query, ['pagina', 'limite', 'categoria'], errores);
      const { pagina, limite } = leerPaginacion(req.query, errores);
      const categoria = req.query.categoria;
      if (categoria !== undefined && !CATEGORIAS.includes(categoria)) {
        errores.push({ campo: 'categoria', mensaje: `debe ser uno de: ${CATEGORIAS.join(', ')}` });
      }
      terminar(errores);
      const { data, paginacion } = peleadores.listar({ pagina, limite, categoria });
      res.status(200).json({ ok: true, data, paginacion });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: peleadores.obtener(leerId(req.params.id)) });
    })
    .all(metodoNoPermitido(['GET']));

  return router;
}
