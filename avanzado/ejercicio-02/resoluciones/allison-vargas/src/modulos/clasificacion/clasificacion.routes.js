import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { paginar } from '../../utils/paginacion.js';
import { metodoNoPermitido } from '../../middlewares/metodoNoPermitido.js';
import { validarId } from '../../validators/id.validator.js';
import { leerListado, filtroEnum } from '../../validators/consulta.js';
import { REGIONES } from '../../constants/dominio.js';

const configListado = {
  filtros: { region: filtroEnum(REGIONES) },
  ordenes: { posicion: () => 0 },
  ordenPorDefecto: 'posicion',
};

const etiquetaCache = (acierto) => (acierto ? 'HIT' : 'MISS');

export function crearClasificacionRouter({ clasificacion }) {
  const router = Router();

  router.route('/')
    .get(catchAsync(async (req, res) => {
      const consulta = leerListado(req.query, configListado);
      const { valor, acierto } = await clasificacion.ranking();
      const { region } = consulta.filtros;
      const filas = region ? valor.filter((fila) => fila.region === region) : valor;
      const { data, paginacion } = paginar(filas, consulta.pagina, consulta.limite);
      res.set({
        'X-Cache': etiquetaCache(acierto),
        'Cache-Control': 'no-cache',
        'X-Total-Count': String(paginacion.total),
      });
      res.status(200).json({ ok: true, data, paginacion });
    }))
    .all(metodoNoPermitido(['GET']));

  router.route('/:jugadorId')
    .get(catchAsync(async (req, res) => {
      const { fila, acierto } = await clasificacion.posicionDe(validarId(req.params.jugadorId));
      res.set({ 'X-Cache': etiquetaCache(acierto), 'Cache-Control': 'no-cache' });
      res.status(200).json({ ok: true, data: fila });
    }))
    .all(metodoNoPermitido(['GET']));

  return router;
}
